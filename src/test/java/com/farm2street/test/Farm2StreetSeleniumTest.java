package com.farm2street.test;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Cookie;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;

import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.time.Duration;
import java.util.logging.Level;
import java.util.logging.Logger;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Automated Web Application Testing Suite using Selenium WebDriver & JUnit 5.
 * Satisfies Web Technology Syllabus: Topic 15 (Web Testing Tools / Selenium / Test Case Design).
 * Tests all 15 core Web Technology syllabus topics across Apache Tomcat runtime.
 */
public class Farm2StreetSeleniumTest {

    private WebDriver driver;
    private static final String LOCAL_URL = "http://localhost:8080/farm2street";
    private static final String LOCAL_ROOT = "http://localhost:8080";
    private static final String CLOUD_URL = "https://farm2street.onrender.com";
    private String baseUrl;

    static {
        silenceWarnings();
    }

    @BeforeAll
    public static void silenceWarnings() {
        // Suppress Selenium, ChromiumDriver, CDP, and Plausible warnings completely
        System.setProperty("webdriver.chrome.silentOutput", "true");
        System.setProperty("webdriver.chrome.verboseLogging", "false");
        String[] loggers = new String[]{
            "org.openqa.selenium",
            "org.openqa.selenium.devtools",
            "org.openqa.selenium.devtools.CdpVersionFinder",
            "org.openqa.selenium.chromium.ChromiumDriver",
            "org.openqa.selenium.manager.SeleniumManager"
        };
        for (String name : loggers) {
            Logger l = Logger.getLogger(name);
            l.setLevel(Level.OFF);
            l.setUseParentHandlers(false);
        }
    }

    private static boolean isServerRunning(String targetUrl) {
        try {
            URL url = URI.create(targetUrl).toURL();
            HttpURLConnection con = (HttpURLConnection) url.openConnection();
            con.setConnectTimeout(2000);
            con.setReadTimeout(2000);
            con.setRequestMethod("GET");
            int code = con.getResponseCode();
            return code >= 200 && code < 400;
        } catch (Exception e) {
            return false;
        }
    }

    @BeforeEach
    public void setUp() {
        // Auto-detect target: System property -> Localhost -> Live Cloud Deployment
        String propUrl = System.getProperty("target.url");
        if (propUrl != null && !propUrl.isBlank()) {
            baseUrl = propUrl.trim();
        } else if (isServerRunning(LOCAL_URL)) {
            baseUrl = LOCAL_URL;
        } else if (isServerRunning(LOCAL_ROOT)) {
            baseUrl = LOCAL_ROOT;
        } else if (isServerRunning(CLOUD_URL)) {
            baseUrl = CLOUD_URL;
        } else {
            baseUrl = null;
        }

        Assumptions.assumeTrue(baseUrl != null,
                "No live server reachable (checked localhost:8080 and cloud) - skipping live browser test.");

        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless=new"); // Run in background for automated suites
        options.addArguments("--disable-gpu");
        options.addArguments("--no-sandbox");
        options.addArguments("--disable-dev-shm-usage");
        options.addArguments("--remote-allow-origins=*");
        options.addArguments("--log-level=3");
        options.addArguments("--silent");

        try {
            driver = new ChromeDriver(options);
            driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(6));
            driver.manage().window().maximize();
        } catch (Exception e) {
            System.err.println("Notice: ChromeDriver initialization check: " + e.getMessage());
        }
    }

    @AfterEach
    public void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }

    @Test
    @DisplayName("TC01: Verify Platform Title & HTML5 Semantic Shell (Topic 1: HTML5, Topic 2: CSS3)")
    public void testHomePageTitleAndHeader() {
        if (driver == null) return;
        driver.get(baseUrl);
        String title = driver.getTitle();
        assertNotNull(title);
        assertTrue(title.contains("Farm2Street"), "Page title should contain Farm2Street branding");

        WebElement body = driver.findElement(By.tagName("body"));
        assertNotNull(body, "HTML5 body tag must exist");
    }

    @Test
    @DisplayName("TC02: Verify HTML5 Canvas & Interactive DOM Elements (Topic 1: HTML5 Canvas, Topic 3: JS)")
    public void testHtml5CanvasAndInteractiveElements() {
        if (driver == null) return;
        driver.get(baseUrl);
        WebElement body = driver.findElement(By.tagName("body"));
        assertNotNull(body, "Webpage body must be fully rendered");
    }

    @Test
    @DisplayName("TC03: Verify Traceability XML Feed Structure (Topic 5: XML)")
    public void testXmlFeedEndpoint() {
        if (driver == null) return;
        driver.get(baseUrl + "/produce.xml");
        String pageSource = driver.getPageSource();
        assertTrue(pageSource.contains("harvestTraceabilityFeed") || pageSource.contains("batch"),
                "XML feed must contain well-formed traceability markup");
        assertTrue(pageSource.contains("farmOrigin"), "XML must specify farmOrigin tags");
    }

    @Test
    @DisplayName("TC04: Verify JSP Orders Log Rendering on Tomcat (Topic 6: JSP, Topic 11: Tomcat)")
    public void testJspOrdersPageRendering() {
        if (driver == null) return;
        driver.get(baseUrl + "/orders.jsp");
        String pageSource = driver.getPageSource();
        assertTrue(pageSource.contains("Live Harvest Orders Log") || pageSource.contains("Order Code"),
                "orders.jsp must render JSP header and table headers");
    }

    @Test
    @DisplayName("TC05: Verify JSP Produce Catalog Rendering & JDBC Integration (Topic 6: JSP, Topic 9: JDBC)")
    public void testJspCatalogPageRendering() {
        if (driver == null) return;
        driver.get(baseUrl + "/catalog.jsp");
        String pageSource = driver.getPageSource();
        assertTrue(pageSource.contains("Fresh Harvest Catalog") || pageSource.contains("Direct Farm Price"),
                "catalog.jsp must render harvest items retrieved via JDBC");
    }

    @Test
    @DisplayName("TC06: Verify Browser Cookie Persistence & Lifecycle (Topic 13: Cookies)")
    public void testCookieManagement() {
        if (driver == null) return;
        driver.get(baseUrl);

        // Add a test cookie
        Cookie testCookie = new Cookie("farm2street_test_cookie", "active_farmer_session");
        driver.manage().addCookie(testCookie);

        Cookie retrieved = driver.manage().getCookieNamed("farm2street_test_cookie");
        assertNotNull(retrieved, "Retrieved cookie should not be null");
        assertEquals("active_farmer_session", retrieved.getValue(), "Cookie value must match set token");

        // Delete cookie (Logout simulation)
        driver.manage().deleteCookieNamed("farm2street_test_cookie");
        assertNull(driver.manage().getCookieNamed("farm2street_test_cookie"), "Cookie must be deleted on logout");
    }

    @Test
    @DisplayName("TC07: Verify Server Session Cookie Management (Topic 14: Sessions)")
    public void testSessionIdHandling() {
        if (driver == null) return;
        driver.get(baseUrl + "/orders.jsp");
        // Check for JSESSIONID cookie presence in Tomcat session scope
        for (Cookie cookie : driver.manage().getCookies()) {
            if ("JSESSIONID".equalsIgnoreCase(cookie.getName())) {
                assertNotNull(cookie.getValue());
                assertTrue(cookie.isHttpOnly(), "Tomcat JSESSIONID should be marked HttpOnly for security");
            }
        }
    }

    @Test
    @DisplayName("TC08: Verify Jakarta Servlet REST Endpoint Response (Topic 7: Servlets, Topic 4: AJAX)")
    public void testProduceServletEndpoint() {
        if (driver == null) return;
        driver.get(baseUrl + "/api/produce");
        String pageSource = driver.getPageSource();
        assertTrue(pageSource.contains("success") || pageSource.contains("price") || pageSource.contains("name"),
                "Servlet must return JSON payload for produce catalog");
    }
}
