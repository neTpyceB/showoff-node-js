# Ideas

- Add schema versioning only when multiple event versions are required.
- Add dead-letter storage only when failed events must be retained beyond retry.
- Add fan-out to additional projections only when new read models are explicitly required.
