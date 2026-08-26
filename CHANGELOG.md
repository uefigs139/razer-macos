# Changelog

All notable changes to this fork are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## About this fork

This is a downstream fork of [1kc/razer-macos](https://github.com/1kc/razer-macos),
taken at `v0.4.10`. Upstream has had no commits to `master` since 2022-09-22 and is
not accepting changes, so this fork is maintained independently.

A separate, unrelated fork ([JCKodel/razer-macos](https://github.com/JCKodel/razer-macos))
published a `0.5.0` from the same `v0.4.10` base in December 2022. That release is a
sibling lineage, not an ancestor of this one, and none of its changes are included here.
**Version `0.5.0` is deliberately skipped** so that two different codebases never share a
version number.

## [0.6.0] - 2026-08-25

First tagged release of this fork.

### Added

- Battery level indicator for the Razer Mouse Dock. The dock is lit as a red-to-green
  gradient reflecting the charge of the attached mouse, since the dock has no battery
  telemetry of its own. Selecting any other lighting effect turns the indicator off.
- The indicator setting persists across restarts (`batteryModeActive`) and resumes
  automatically on launch.

### Fixed

- Crash (`EXC_BAD_ACCESS` / `SIGSEGV`) when the battery indicator wrote to a Mouse Dock
  whose USB handle had already been released, for example across sleep and wake, USB
  re-enumeration, or application teardown. The faulting path was:

  ```
  IOUSBLib  IOUSBDeviceClass::deviceGetDeviceProduct + 20
  addon     razer_mouse_dock_attr_write_mode_static + 100
  addon     MouseDockSetModeStatic(Napi::CallbackInfo const&) + 264
  ```

  `getDockTargetDevice()` re-resolved the live dock on every tick but fell back to the
  captured device object when the dock was absent from `activeRazerDevices`. That is
  precisely the case in which the handle is gone, so the fallback reintroduced the stale
  reference it was meant to avoid. It now returns `null` and the tick is skipped.

  Note that the surrounding `try`/`catch` could not have caught this. A use after free
  inside the native addon is a segmentation fault, not a JavaScript exception.

### Changed

- Battery indicator poll interval reduced from 15 seconds to 120 seconds, defined once as
  `BATTERY_POLL_MS` so the two interval call sites cannot drift apart. Battery level
  changes over hours, so the indicator is unaffected, and each tick makes a synchronous
  native USB call, so this also limits exposure to a stale handle.

[0.6.0]: https://github.com/uefigs139/razer-macos/releases/tag/v0.6.0
