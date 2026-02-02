#!/usr/bin/env python3
"""
文档生成器
自动生成/更新 README.md 和 DESIGN.md 骨架
"""

import os
import sys
import json
import ast
from pathlib import Path
from dataclasses import dataclass, field
from typing import List, Dict, Optional
from datetime import datetime


@dataclass
class ModuleInfo:
    name: str
    path: str
    description: str = ""
    language: str = ""
    files: List[str] = field(default_factory=list)
    functions: List[Dict] = field(default_factory=list)
    classes: List[Dict] = field(default_factory=list)
    dependencies: List[str] = field(default_factory=list)
    entry_points: List[str] = field(default_factory=list)


def detect_language(path: Path) -> str:
    """检测主要编程语言"""
    extensions = {}
    for f in path.rglob('*'):
        if f.is_file() and f.suffix:
            ext = f.suffix.lower()
            extensions[ext] = extensions.get(ext, 0) + 1

    lang_map = {
        '.py': 'Python',
        '.go': 'Go',
        '.rs': 'Rust',
        '.ts': 'TypeScript',
        '.js': 'JavaScript',
        '.java': 'Java',
        '.c': 'C',
        '.cpp': 'C++',
    }

    code_exts = {k: v for k, v in extensions.items() if k in lang_map}
    if code_exts:
        main_ext = max(code_exts, key=code_exts.get)
        return lang_map.get(main_ext, 'Unknown')

    return 'Unknown'


def analyze_python_module(path: Path) -> ModuleInfo:
    """分析 Python 模块"""
    info = ModuleInfo(name=path.name, path=str(path), language='Python')

    # 收集文件
    py_files = list(path.rglob('*.py'))
    info.files = [str(f.relative_to(path)) for f in py_files]

    # 分析主要文件
    for py_file in py_files:
        if py_file.name.startswith('test_') or '_test' in py_file.name:
            continue

        try:
            content = py_file.read_text(encoding='utf-8', errors='ignore')
            tree = ast.parse(content)

            # 提取模块文档字符串
            if (ast.get_docstring(tree) and not info.description):
                info.description = ast.get_docstring(tree).split('\n')[0]

            # 提取函数和类
            for node in ast.walk(tree):
                if isinstance(node, ast.FunctionDef) and not node.name.startswith('_'):
                    doc = ast.get_docstring(node) or ""
                    info.functions.append({
                        "name": node.name,
                        "file": str(py_file.relative_to(path)),
                        "doc": doc.split('\n')[0] if doc else ""
                    })
                elif isinstance(node, ast.ClassDef) and not node.name.startswith('_'):
                    doc = ast.get_docstring(node) or ""
                    info.classes.append({
                        "name": node.name,
                        "file": str(py_file.relative_to(path)),
                        "doc": doc.split('\n')[0] if doc else ""
                    })

            # 检测入口点
            if py_file.name in ['main.py', '__main__.py', 'cli.py', 'app.py']:
                info.entry_points.append(str(py_file.relative_to(path)))

        except Exception:
            continue

    # 检测依赖
    req_files = ['requirements.txt', 'pyproject.toml', 'setup.py']
    for req_file in req_files:
        req_path = path / req_file
        if req_path.exists():
            try:
                content = req_path.read_text()
                if req_file == 'requirements.txt':
                    for line in content.split('\n'):
                        line = line.strip()
                        if line and not line.startswith('#'):
                            pkg = line.split('==')[0].split('>=')[0].split('<=')[0]
                            info.dependencies.append(pkg)
            except Exception:
                pass

    return info


def analyze_module(path: Path) -> ModuleInfo:
    """分析模块"""
    language = detect_language(path)

    if language == 'Python':
        return analyze_python_module(path)

    # 通用分析
    info = ModuleInfo(name=path.name, path=str(path), language=language)

    code_extensions = {'.py', '.go', '.rs', '.ts', '.js', '.java', '.c', '.cpp'}
    for f in path.rglob('*'):
        if f.is_file() and f.suffix.lower() in code_extensions:
            info.files.append(str(f.relative_to(path)))

    return info


def generate_readme(info: ModuleInfo, existing_content: str = None) -> str:
    """生成 README.md"""
    lines = []

    lines.append(f"# {info.name}")
    lines.append("")

    # 描述
    if info.description:
        lines.append(info.description)
    else:
        lines.append("> TODO: 添加模块描述")
    lines.append("")

    # 概述
    lines.append("## 概述")
    lines.append("")
    lines.append("<!-- 描述这个模块是什么，解决什么问题 -->")
    lines.append("")

    # 特性
    lines.append("## 特性")
    lines.append("")
    lines.append("- TODO: 列出主要特性")
    lines.append("")

    # 安装/依赖
    if info.dependencies:
        lines.append("## 依赖")
        lines.append("")
        lines.append("```")
        for dep in info.dependencies[:10]:
            lines.append(dep)
        if len(info.dependencies) > 10:
            lines.append(f"# ... 及其他 {len(info.dependencies) - 10} 个依赖")
        lines.append("```")
        lines.append("")

    # 使用方法
    lines.append("## 使用方法")
    lines.append("")

    if info.entry_points:
        lines.append("### 运行")
        lines.append("")
        lines.append("```bash")
        if info.language == 'Python':
            lines.append(f"python -m {info.name}")
        else:
            lines.append(f"# TODO: 添加运行命令")
        lines.append("```")
        lines.append("")

    lines.append("### 示例")
    lines.append("")
    lines.append("```" + info.language.lower())
    lines.append("# TODO: 添加使用示例")
    lines.append("```")
    lines.append("")

    # API 概览
    if info.classes or info.functions:
        lines.append("## API 概览")
        lines.append("")

        if info.classes:
            lines.append("### 类")
            lines.append("")
            lines.append("| 类名 | 描述 |")
            lines.append("|------|------|")
            for cls in info.classes[:10]:
                lines.append(f"| `{cls['name']}` | {cls['doc'] or 'TODO'} |")
            lines.append("")

        if info.functions:
            lines.append("### 函数")
            lines.append("")
            lines.append("| 函数 | 描述 |")
            lines.append("|------|------|")
            for func in info.functions[:10]:
                lines.append(f"| `{func['name']}()` | {func['doc'] or 'TODO'} |")
            lines.append("")

    # 目录结构
    lines.append("## 目录结构")
    lines.append("")
    lines.append("```")
    lines.append(f"{info.name}/")
    for f in sorted(info.files)[:15]:
        lines.append(f"├── {f}")
    if len(info.files) > 15:
        lines.append(f"└── ... ({len(info.files) - 15} more files)")
    lines.append("```")
    lines.append("")

    # 相关文档
    lines.append("## 相关文档")
    lines.append("")
    lines.append("- [设计文档](DESIGN.md)")
    lines.append("")

    return "\n".join(lines)


def generate_design(info: ModuleInfo, existing_content: str = None) -> str:
    """生成 DESIGN.md"""
    lines = []
    today = datetime.now().strftime("%Y-%m-%d")

    lines.append(f"# {info.name} 设计文档")
    lines.append("")

    # 概述
    lines.append("## 设计概述")
    lines.append("")
    lines.append("### 目标")
    lines.append("")
    lines.append("<!-- 这个模块要解决什么问题？ -->")
    lines.append("")
    lines.append("### 非目标")
    lines.append("")
    lines.append("<!-- 这个模块明确不做什么？ -->")
    lines.append("")

    # 架构
    lines.append("## 架构设计")
    lines.append("")
    lines.append("### 整体架构")
    lines.append("")
    lines.append("```")
    lines.append("┌─────────────────────────────────────┐")
    lines.append("│           TODO: 架构图              │")
    lines.append("└─────────────────────────────────────┘")
    lines.append("```")
    lines.append("")

    lines.append("### 核心组件")
    lines.append("")
    if info.classes:
        for cls in info.classes[:5]:
            lines.append(f"- **{cls['name']}**: {cls['doc'] or 'TODO: 描述职责'}")
    else:
        lines.append("- TODO: 列出核心组件及其职责")
    lines.append("")

    # 设计决策
    lines.append("## 设计决策")
    lines.append("")
    lines.append("### 决策记录")
    lines.append("")
    lines.append("| 日期 | 决策 | 理由 | 影响 |")
    lines.append("|------|------|------|------|")
    lines.append(f"| {today} | 初始设计 | - | - |")
    lines.append("")

    lines.append("### 技术选型")
    lines.append("")
    lines.append(f"- **语言**: {info.language}")
    if info.dependencies:
        lines.append(f"- **主要依赖**: {', '.join(info.dependencies[:5])}")
    lines.append("- **理由**: TODO")
    lines.append("")

    # 权衡取舍
    lines.append("## 权衡取舍")
    lines.append("")
    lines.append("### 已知限制")
    lines.append("")
    lines.append("- TODO: 列出已知限制")
    lines.append("")
    lines.append("### 技术债务")
    lines.append("")
    lines.append("- TODO: 记录有意引入的技术债务及原因")
    lines.append("")

    # 安全考量
    lines.append("## 安全考量")
    lines.append("")
    lines.append("### 威胁模型")
    lines.append("")
    lines.append("- TODO: 识别潜在威胁")
    lines.append("")
    lines.append("### 安全措施")
    lines.append("")
    lines.append("- TODO: 列出已实施的安全措施")
    lines.append("")

    # 变更历史
    lines.append("## 变更历史")
    lines.append("")
    lines.append(f"### {today} - 初始版本")
    lines.append("")
    lines.append("**变更内容**: 创建模块")
    lines.append("")
    lines.append("**变更理由**: 初始开发")
    lines.append("")

    return "\n".join(lines)


def generate_docs(path: str, force: bool = False) -> Dict[str, str]:
    """生成文档"""
    module_path = Path(path).resolve()
    result = {"readme": None, "design": None, "status": "success", "messages": []}

    if not module_path.exists():
        result["status"] = "error"
        result["messages"].append(f"路径不存在: {module_path}")
        return result

    # 分析模块
    info = analyze_module(module_path)

    # 生成 README.md
    readme_path = module_path / "README.md"
    if readme_path.exists() and not force:
        result["messages"].append("README.md 已存在，跳过（使用 --force 覆盖）")
    else:
        existing = readme_path.read_text() if readme_path.exists() else None
        content = generate_readme(info, existing)
        readme_path.write_text(content)
        result["readme"] = str(readme_path)
        result["messages"].append(f"已生成 README.md")

    # 生成 DESIGN.md
    design_path = module_path / "DESIGN.md"
    if design_path.exists() and not force:
        result["messages"].append("DESIGN.md 已存在，跳过（使用 --force 覆盖）")
    else:
        existing = design_path.read_text() if design_path.exists() else None
        content = generate_design(info, existing)
        design_path.write_text(content)
        result["design"] = str(design_path)
        result["messages"].append(f"已生成 DESIGN.md")

    return result


def main():
    import argparse

    parser = argparse.ArgumentParser(description="文档生成器")
    parser.add_argument("path", nargs="?", default=".", help="模块路径")
    parser.add_argument("-f", "--force", action="store_true", help="覆盖已存在的文档")
    parser.add_argument("--json", action="store_true", help="JSON 格式输出")
    parser.add_argument("--readme-only", action="store_true", help="仅生成 README.md")
    parser.add_argument("--design-only", action="store_true", help="仅生成 DESIGN.md")

    args = parser.parse_args()

    result = generate_docs(args.path, args.force)

    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        print("=" * 50)
        print("文档生成报告")
        print("=" * 50)
        for msg in result["messages"]:
            print(f"  • {msg}")
        print("=" * 50)

    sys.exit(0 if result["status"] == "success" else 1)


if __name__ == "__main__":
    main()
