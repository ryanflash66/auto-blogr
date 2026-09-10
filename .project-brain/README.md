# Project Brain Project Directory

Committed files contain logical identity and policy references. Machine-local paths and runtime state remain gitignored.

```text
.project-brain/
|-- project.yaml
|-- agents.yaml
|-- graph.yaml
|-- context-policy.yaml
|-- artifact-policy.yaml
|-- local.yaml                 # gitignored
+-- runtime/                  # gitignored
```

Never store provider secrets in this directory.

