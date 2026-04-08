@echo off
cd /d %~dp0

echo [ReqSAP] Instalando dependencias...
call npm install
if errorlevel 1 goto :error

echo [ReqSAP] Iniciando aplicacao e abrindo no navegador...
call npm run dev -- --host 0.0.0.0 --open
if errorlevel 1 goto :error

goto :eof

:error
echo [ReqSAP] Ocorreu um erro ao iniciar.
exit /b 1
