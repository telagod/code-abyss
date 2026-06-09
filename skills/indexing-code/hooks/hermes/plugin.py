"""Hermes plugin: abyss code intelligence hooks."""
import json
import subprocess
import os

HOOK_DIR = os.path.join(os.path.dirname(__file__), "..", "common")


def _has_abyss():
    try:
        subprocess.run(["abyss", "--version"], capture_output=True, check=True)
        return True
    except Exception:
        return False


def _run_hook(script, stdin_data=None):
    try:
        result = subprocess.run(
            ["bash", os.path.join(HOOK_DIR, script)],
            input=stdin_data,
            capture_output=True,
            text=True,
            timeout=10,
        )
        if result.stderr:
            print(result.stderr, end="", file=__import__("sys").stderr)
    except Exception:
        pass


def register(ctx):
    if not _has_abyss():
        return

    @ctx.register_hook("on_session_start")
    def on_start(event):
        _run_hook("session-init.sh")

    @ctx.register_hook("pre_tool_call")
    def pre_tool(event):
        tool = event.get("tool_name", "")
        if tool in ("edit_file", "write_file", "Edit", "Write", "replace"):
            stdin = json.dumps(event.get("tool_input", {}))
            _run_hook("pre-edit-check.sh", stdin)
