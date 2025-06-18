# Debug and Console Logs Directory

This directory is used to store debug logs and console output during testing.

## Purpose

- **Debug JSON files**: Exported debug data from test runs
- **Console logs**: Browser console output captured during testing
- **Temporary storage**: For analysis and troubleshooting

## Usage

During testing, debug files will be automatically generated here:
- `exchain-debug-YYYY-MM-DDTHH-MM-SS.json` - Debug data exports
- `localhost-*.log` - Console log captures

## Git Ignore

Debug files are excluded from Git commits via `.gitignore`:
```
docs/DebugAndConsoleLogs/*.json
docs/DebugAndConsoleLogs/*.log
```

This prevents large log files from being committed to the repository while maintaining the directory structure.

## Analysis

Debug files can be analyzed to:
- Verify IOID injection timing
- Check adapter version loading
- Monitor ORTB2 configuration changes
- Troubleshoot auction issues

---

**Note**: This directory is intentionally empty in the repository. Debug files are generated during testing and should not be committed. 