# Changelog

## [0.2.1](https://github.com/DheerajMahra/openmascot/compare/openmascot-v0.2.0...openmascot-v0.2.1) (2026-11-24)


### Features

* **embed:** check mascot documents before playing them ([ae156fd](https://github.com/DheerajMahra/openmascot/commit/ae156fd21e0d6be1b168a1dcf828ba6cc6cf6360))
* **embed:** export the format's rules alongside the runtime ([ae9d878](https://github.com/DheerajMahra/openmascot/commit/ae9d8789469004056ffb5f9ef85d3b2faf850e42))
* **embed:** rewire triggers when a player's doc changes ([6c30ca4](https://github.com/DheerajMahra/openmascot/commit/6c30ca43dad613d5e3399fcb89f37f2efe574d0e))

## [0.2.0](https://github.com/DheerajMahra/openmascot/compare/openmascot-v0.1.0...openmascot-v0.2.0) (2026-11-09)


### ⚠ BREAKING CHANGES

* **embed:** frames use y (positive up) in place of offset (positive down), and offset is no longer read. sequencePadding and MascotPadding are no longer exported; frameShift is new.

### Features

* **embed:** move frames with x and y and keep the mascot box fixed ([a4ab36f](https://github.com/DheerajMahra/openmascot/commit/a4ab36f6933f7fc562962657340433a44b3298e8))
