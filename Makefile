# StoreDesk - run everything from the repo root:  make <target>
#
# The Makefile is the menu. On Windows, tasks run through scripts/make.ps1
# (PowerShell is required for new terminal windows, MongoDB checks, etc.)
#
# No GNU make? Use:  make.cmd dev

ROOT := $(abspath $(dir $(lastword $(MAKEFILE_LIST))))
RUN  := powershell -NoProfile -ExecutionPolicy Bypass -File "$(ROOT)/scripts/make.ps1"

.DEFAULT_GOAL := help

.PHONY: help setup env reset-local mongo mongo-reset dev server electron stop status \
	apk install install-server install-electron install-mobile ci ci-server ci-electron ci-mobile

help setup env reset-local mongo mongo-reset dev server electron stop status \
	apk install install-server install-electron install-mobile ci ci-server ci-electron ci-mobile:
	@$(RUN) $@
