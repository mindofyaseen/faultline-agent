# Contributing to FAULTLINE

Thank you for your interest in contributing to **FAULTLINE**!

## Code of Conduct
We are committed to providing a friendly, safe, and welcoming environment for all contributors. Please treat fellow contributors with respect.

## How to Contribute
1. **Fork the Repository:** Create a fork of this repository to work on your proposed changes.
2. **Create a Feature Branch:** `git checkout -b feature/your-feature-name`
3. **Ensure Deterministic Verification:**
   - Any new scenario must have explicit baseline records, fault records, declared invariants, and an approved guardrail.
   - Run the automated test suite with `pytest -v tests/` and verify that all tests pass.
4. **Keep Secrets Out:** Never commit AWS credentials, API keys, or private environment files.
5. **Submit a Pull Request:** Open a PR against `main` describing your changes and attaching test results.

## Reporting Issues
If you encounter a bug or unexpected behavior, please open an issue on GitHub with reproduction steps and fixture data.
