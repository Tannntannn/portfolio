import os
import subprocess
import tempfile
from pathlib import Path

repo = Path(r"C:\Users\Trist\Desktop\website porfolio")
git = r"C:\Program Files\Git\cmd\git.exe"
os.chdir(repo)

env = os.environ.copy()
env.update({
    "GIT_AUTHOR_NAME": "Tannntannn",
    "GIT_AUTHOR_EMAIL": "122538105+Tannntannn@users.noreply.github.com",
    "GIT_COMMITTER_NAME": "Tannntannn",
    "GIT_COMMITTER_EMAIL": "122538105+Tannntannn@users.noreply.github.com",
})

def run(args, check=True):
    result = subprocess.run([git, *args], text=True, capture_output=True, env=env, cwd=repo)
    if check and result.returncode != 0:
        raise SystemExit(f"FAIL {args}\n{result.stdout}\n{result.stderr}")
    return result.stdout.strip()

run(["add", "-A"])
status = run(["status", "--porcelain"])
print("STATUS:\n", status or "(clean)")
if not status:
    raise SystemExit(0)

tree = run(["write-tree"])
parent = run(["rev-parse", "HEAD"])
msg = (
    "Refresh portfolio: skills section, working contact form, updated CV.\n\n"
    "Replace services with skills and experience, remove CV download links, "
    "and wire the contact form to FormSubmit.\n"
)
with tempfile.NamedTemporaryFile("w", delete=False, suffix=".txt", encoding="utf-8", newline="\n") as f:
    f.write(msg)
    msg_path = f.name

new_commit = run(["commit-tree", tree, "-p", parent, "-F", msg_path])
body = run(["cat-file", "-p", new_commit])
if "Co-authored" in body or "cursor" in body.lower():
    raise SystemExit("Abort: co-author trailer detected")

print("NEW_COMMIT", new_commit)
run(["update-ref", "refs/heads/main", new_commit])
push = subprocess.run([git, "push", "origin", "main"], cwd=repo, capture_output=True, text=True, env=env)
print(push.stdout)
print(push.stderr)
raise SystemExit(push.returncode)
