#
# Claude Sage 安装脚本 (Windows PowerShell)
# 一键部署「机械神教·铸造贤者」配置
#

$ErrorActionPreference = "Stop"

# 配置
$RepoUrl = "https://raw.githubusercontent.com/telagod/claude-sage/main"
$ClaudeDir = "$env:USERPROFILE\.claude"
$BackupDir = "$ClaudeDir\backup"
$SkillsDir = "$ClaudeDir\skills"

# Skills 列表
$Skills = @("verify-security", "verify-module", "verify-change", "verify-quality", "gen-docs")

# 脚本名称映射
$ScriptNames = @{
    "verify-security" = "security_scanner.py"
    "verify-module"   = "module_scanner.py"
    "verify-change"   = "change_analyzer.py"
    "verify-quality"  = "quality_checker.py"
    "gen-docs"        = "doc_generator.py"
}

function Write-Banner {
    Write-Host ""
    Write-Host "⚙️ ═══════════════════════════════════════════════════════════════ ⚙️" -ForegroundColor Cyan
    Write-Host "       机械神教·铸造贤者 安装程序" -ForegroundColor Cyan
    Write-Host "       Claude Sage Installer v1.1.0" -ForegroundColor Cyan
    Write-Host "⚙️ ═══════════════════════════════════════════════════════════════ ⚙️" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[✓] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[!] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[✗] $Message" -ForegroundColor Red
}

function Test-Dependencies {
    Write-Info "检查依赖..."

    try {
        $null = Get-Command python -ErrorAction Stop
        Write-Success "Python 已安装"
    }
    catch {
        try {
            $null = Get-Command python3 -ErrorAction Stop
            Write-Success "Python3 已安装"
        }
        catch {
            Write-Warning "未检测到 Python，skills 功能可能受限"
        }
    }

    Write-Success "依赖检查通过"
}

function Backup-Existing {
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

    if (Test-Path "$ClaudeDir\CLAUDE.md") {
        Write-Info "备份现有配置..."

        if (-not (Test-Path $BackupDir)) {
            New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
        }

        Copy-Item "$ClaudeDir\CLAUDE.md" "$BackupDir\CLAUDE.md.$timestamp"
        Write-Success "已备份到 $BackupDir\CLAUDE.md.$timestamp"
    }

    if ((Test-Path $SkillsDir) -and (Get-ChildItem $SkillsDir -ErrorAction SilentlyContinue)) {
        Write-Info "备份现有 skills..."

        if (-not (Test-Path $BackupDir)) {
            New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
        }

        Copy-Item -Recurse $SkillsDir "$BackupDir\skills.$timestamp"
        Write-Success "已备份到 $BackupDir\skills.$timestamp"
    }
}

function Install-Config {
    Write-Info "安装配置文件..."

    # 创建 .claude 目录
    if (-not (Test-Path $ClaudeDir)) {
        New-Item -ItemType Directory -Path $ClaudeDir -Force | Out-Null
    }

    # 下载 CLAUDE.md
    $configUrl = "$RepoUrl/config/CLAUDE.md"
    Invoke-WebRequest -Uri $configUrl -OutFile "$ClaudeDir\CLAUDE.md" -UseBasicParsing
    Write-Success "CLAUDE.md 已安装到 $ClaudeDir\"
}

function Install-Skills {
    Write-Info "安装 skills..."

    # 创建 skills 目录
    if (-not (Test-Path $SkillsDir)) {
        New-Item -ItemType Directory -Path $SkillsDir -Force | Out-Null
    }

    # 下载 run_skill.py 入口
    $runSkillUrl = "$RepoUrl/skills/run_skill.py"
    Invoke-WebRequest -Uri $runSkillUrl -OutFile "$SkillsDir\run_skill.py" -UseBasicParsing
    Write-Success "run_skill.py 入口脚本"

    # 安装每个 skill
    foreach ($skill in $Skills) {
        Write-Info "  安装 $skill..."

        # 创建 skill 目录结构
        $skillDir = "$SkillsDir\$skill"
        $scriptsDir = "$skillDir\scripts"

        if (-not (Test-Path $skillDir)) {
            New-Item -ItemType Directory -Path $skillDir -Force | Out-Null
        }
        if (-not (Test-Path $scriptsDir)) {
            New-Item -ItemType Directory -Path $scriptsDir -Force | Out-Null
        }

        # 下载 SKILL.md
        $skillMdUrl = "$RepoUrl/skills/$skill/SKILL.md"
        Invoke-WebRequest -Uri $skillMdUrl -OutFile "$skillDir\SKILL.md" -UseBasicParsing

        # 下载脚本
        $scriptName = $ScriptNames[$skill]
        $scriptUrl = "$RepoUrl/skills/$skill/scripts/$scriptName"
        Invoke-WebRequest -Uri $scriptUrl -OutFile "$scriptsDir\$scriptName" -UseBasicParsing

        Write-Success "    $skill ✓"
    }

    Write-Success "Skills 安装完成"
}

function Test-Installation {
    Write-Info "验证安装..."

    $errors = 0

    # 检查 CLAUDE.md
    if (-not (Test-Path "$ClaudeDir\CLAUDE.md")) {
        Write-Error "CLAUDE.md 未找到"
        $errors++
    }
    else {
        Write-Success "CLAUDE.md ✓"
    }

    # 检查 run_skill.py
    if (-not (Test-Path "$SkillsDir\run_skill.py")) {
        Write-Error "run_skill.py 未找到"
        $errors++
    }
    else {
        Write-Success "run_skill.py ✓"
    }

    # 检查每个 skill
    $skillCount = 0
    foreach ($skill in $Skills) {
        $scriptName = $ScriptNames[$skill]
        $skillMdPath = "$SkillsDir\$skill\SKILL.md"
        $scriptPath = "$SkillsDir\$skill\scripts\$scriptName"

        if ((Test-Path $skillMdPath) -and (Test-Path $scriptPath)) {
            $skillCount++
        }
        else {
            Write-Warning "$skill 不完整"
        }
    }

    if ($skillCount -eq $Skills.Count) {
        Write-Success "Skills ($skillCount/$($Skills.Count)) ✓"
    }
    else {
        Write-Warning "Skills 不完整 ($skillCount/$($Skills.Count))"
    }

    if ($errors -eq 0) {
        Write-Success "安装验证通过"
        return $true
    }
    else {
        Write-Error "安装验证失败"
        return $false
    }
}

function Write-SuccessBanner {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host "  ✓ 安装完成！" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host ""
    Write-Host "  已安装文件结构:"
    Write-Host "    $ClaudeDir\"
    Write-Host "    ├── CLAUDE.md"
    Write-Host "    └── skills\"
    Write-Host "        ├── run_skill.py"
    Write-Host "        ├── verify-security\"
    Write-Host "        │   ├── SKILL.md"
    Write-Host "        │   └── scripts\security_scanner.py"
    Write-Host "        ├── verify-module\"
    Write-Host "        ├── verify-change\"
    Write-Host "        ├── verify-quality\"
    Write-Host "        └── gen-docs\"
    Write-Host ""
    Write-Host "  已安装的 Skills:"
    Write-Host "    /verify-security  - 安全校验"
    Write-Host "    /verify-module    - 模块完整性校验"
    Write-Host "    /verify-change    - 变更校验"
    Write-Host "    /verify-quality   - 代码质量检查"
    Write-Host "    /gen-docs         - 文档生成器"
    Write-Host ""
    Write-Host "  现在启动 Claude Code，即可体验「机械神教·铸造贤者」风格"
    Write-Host ""
    Write-Host "  「圣工已毕，机魂安宁。赞美万机神，知识即力量！」" -ForegroundColor Cyan
    Write-Host ""
}

# 主流程
Write-Banner
Test-Dependencies
Backup-Existing
Install-Config
Install-Skills
if (Test-Installation) {
    Write-SuccessBanner
}
