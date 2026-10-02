package com.farm2street.model;

import java.io.Serializable;

/**
 * Model representing fresh farm produce & harvest batch.
 */
public class Produce implements Serializable {
    private static final long serialVersionUID = 1L;

    private int id;
    private String name;
    private String category;
    private double price;
    private String unit;
    private int stock;
    private String farmName;
    private String farmLocation;
    private String harvestDate;
    private String batchId;
    private String imageUrl;
    private boolean organic;

    public Produce() {}

    public Produce(int id, String name, String category, double price, String unit, int stock,
                   String farmName, String farmLocation, String harvestDate, String batchId,
                   String imageUrl, boolean organic) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.price = price;
        this.unit = unit;
        this.stock = stock;
        this.farmName = farmName;
        this.farmLocation = farmLocation;
        this.harvestDate = harvestDate;
        this.batchId = batchId;
        this.imageUrl = imageUrl;
        this.organic = organic;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public int getStock() { return stock; }
    public void setStock(int stock) { this.stock = stock; }

    public String getFarmName() { return farmName; }
    public void setFarmName(String farmName) { this.farmName = farmName; }

    public String getFarmLocation() { return farmLocation; }
    public void setFarmLocation(String farmLocation) { this.farmLocation = farmLocation; }

    public String getHarvestDate() { return harvestDate; }
    public void setHarvestDate(String harvestDate) { this.harvestDate = harvestDate; }

    public String getBatchId() { return batchId; }
    public void setBatchId(String batchId) { this.batchId = batchId; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public boolean isOrganic() { return organic; }
    public void setOrganic(boolean organic) { this.organic = organic; }

    public int getAvailableQty() { return stock; }
    public void setAvailableQty(int availableQty) { this.stock = availableQty; }

    public String getDescription() {
        return (organic ? "Certified Organic " : "Farm Fresh ") + name + " harvested directly at " + farmName + " (" + farmLocation + ").";
    }
}
