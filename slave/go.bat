@echo off
setlocal enabledelayedexpansion

echo "===== init ====="
set ip_address_string="IPv4"
set JMETER_HUB="10.14.137.18"
set TARGET_SERVER_DOMAIN="pre.vip.jd.com"

echo "===== turn off the filewall ====="
netsh advfirewall set currentprofile state off
netsh advfirewall set domainprofile state off
netsh advfirewall set privateprofile state off

echo "===== check network to jmeter controller ====="
ping %JMETER_HUB% -n 1 -w 1000 > nul
if errorlevel 1 (
  echo [WARNING] %JMETER_HUB% is not reachable!
  goto exit_with_error message
)

echo "===== test network to target host ====="
ping %TARGET_SERVER_DOMAIN% -n 1 -w 1000 > nul
if errorlevel 1 (
  echo [ERROR] %TARGET_SERVER_DOMAIN% is not reachable!
  goto exit_with_error
)

echo "==== get local time ===="
set datetime=%date:~0,4%-%date:~5,2%-%date:~8,2%%%20%time: =0%

echo "==== get ip address ===="
set query_string=host=%ComputerName%^&t=%datetime%

for /f "usebackq tokens=2 delims=:" %%f in (`ipconfig ^| findstr /c:%ip_address_string%`) do (
  set CURRENT_IP=%%f
  set query_string=!query_string!^&ip=!CURRENT_IP: =!
)

echo "==== report ip address, local time and hostname ===="
curl --globoff http://!JMETER_HUB!/report?!query_string!
echo ...

echo "==== start jmeter server ===="
jmeter/bin/jmeter-server.bat

endlocal

goto end_of_script

:exit_with_error
pause
exit 1

:end_of_script
exit 0
