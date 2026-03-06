import subprocess


def run_pre_commit_hook(hook_id):
    """Runs a specific pre-commit hook via uv."""
    print(f"--- Running {hook_id} ---")
    command = f"uv run pre-commit run {hook_id} --all-files --hook-stage manual"
    result = subprocess.run(command, shell=True, text=True, capture_output=True)

    if result.returncode != 0:
        print(result.stdout.strip())
        return False

    print("✅ Passed")
    return True


def main():

    hooks = [
        "check-model-has-all-columns",
        "check-model-columns-have-desc",
        "check-model-has-description",
    ]

    results = {}
    for hook in hooks:
        results[hook] = run_pre_commit_hook(hook)

    # Summary
    print("\n" + "=" * 20)
    print("FINAL SUMMARY")
    all_passed = True
    for hook, passed in results.items():
        status = "✅" if passed else "❌"
        print(f"{status} {hook}")
        if not passed:
            all_passed = False

    if not all_passed:
        exit(1)


if __name__ == "__main__":
    main()
