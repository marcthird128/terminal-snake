@echo off

echo Terminal-snake build via pkg
echo Will fail if you dont have pkg
echo.

REM remove old buildsf exist "build" (
    del /q "build\*.*"
    echo Old builds removed.
) else (
    echo No existing build directory found.
)

REM build for correct platform
:PROMPT
echo Are you on ARM? (y/n)
choice /c yn /n /m ""
if errorlevel 2 goto :SETx64
if errorlevel 1 goto :SETARM
goto :PROMPT

REM set target
:SETx64
set "TARGET=x64"
goto :BUILD
:SETARM
set "TARGET=ARM"

REM build
:BUILD

echo Building for windows %TARGET%
cmd /c "pkg snake.js -o build/snake-node18-win-%TARGET% -t node18-win-%TARGET%"
echo Building for linux %TARGET%
cmd /c "pkg snake.js -o build/snake-node18-linux-%TARGET% -t node18-linux-%TARGET%"
echo Building for macos %TARGET%
cmd /c "pkg snake.js -o build/snake-node18-macos-%TARGET% -t node18-macos-%TARGET%"

echo.
echo Built succesfully
echo Results in ./build