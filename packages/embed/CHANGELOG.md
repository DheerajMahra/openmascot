# Changelog

## [0.2.0](https://github.com/DheerajMahra/openmascot/compare/openmascot-v0.1.0...openmascot-v0.2.0) (2026-11-09)


### ⚠ BREAKING CHANGES

* **embed:** frames use y (positive up) in place of offset (positive down), and offset is no longer read. sequencePadding and MascotPadding are no longer exported; frameShift is new.

### Features

* **embed:** move frames with x and y and keep the mascot box fixed ([a4ab36f](https://github.com/DheerajMahra/openmascot/commit/a4ab36f6933f7fc562962657340433a44b3298e8))
