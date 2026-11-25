param(
    [string]$SupabaseUrl = $env:VITE_SUPABASE_URL,
    [string]$SupabaseAnonKey = $env:VITE_SUPABASE_ANON_KEY
)

if ([string]::IsNullOrWhiteSpace($SupabaseUrl)) {
    $SupabaseUrl = "https://aydjkpolejhsmpsrmgfo.supabase.co"
}
if ([string]::IsNullOrWhiteSpace($SupabaseAnonKey)) {
    $SupabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5ZGprcG9sZWpoc21wc3JtZ2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5NTM2MDksImV4cCI6MjEwNjUyOTYwOX0.eKqqXMKn1jhSli1y_XYNvaU5tK_qcV2ada-iOPPeuYg"
}

$endpoint = "$SupabaseUrl/rest/v1/produce?select=id&limit=1"
$headers = @{
    "apikey"        = $SupabaseAnonKey
    "Authorization" = "Bearer $SupabaseAnonKey"
}

Write-Host "Pinging Supabase keepalive endpoint: $endpoint"
try {
    $response = Invoke-RestMethod -Uri $endpoint -Headers $headers -Method Get -TimeoutSec 15
    Write-Host "SUCCESS: Supabase database is awake and responsive." -ForegroundColor Green
    $response | ConvertTo-Json -Compress | Write-Host
} catch {
    Write-Host "FAILED: Could not reach Supabase ($($_.Exception.Message))." -ForegroundColor Red
    Write-Host "If the project is paused, resume it at https://supabase.com/dashboard/project/aydjkpolejhsmpsrmgfo" -ForegroundColor Yellow
    exit 1
}
