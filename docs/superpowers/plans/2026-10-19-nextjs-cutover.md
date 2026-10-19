# Next.js cutover implementation plan

**Goal:** Deploy Next.js from main alongside the existing Amplify deployment.
**Architecture:** Preserve the canary platform and legacy branches; complete the
durable OIDC/CDK deployment path and validate the new ALB before DNS cutover.
**Tech stack:** Next.js standalone, GitHub Actions, AWS CDK, ECS/Fargate, ACM.

- [ ] Change deployment-target production validation from master to main, and
      prove master/tag rejection with the existing script tests.
- [ ] Enable main push deployments and main/canary PR checks. Add container
      verification, strict CDK diff errors, TLS/site configuration fingerprinting,
      and HTTPS verification through the ALB with preserved hostname and SNI.
- [ ] Add stage-specific bootstrap qualifiers, a durable IAM template and a
      CI-only bootstrap workflow. Preserve existing canary IAM roles.
- [ ] Verify modified contracts, lint, tests, Next build, CDK tests/synth and
      actionlint. Review permission scope and branch selection.
- [ ] Seed main from canary, push feature branch, open main-targeted PR and
      observe CI. Merge green changes, dispatch AWS discovery/bootstrap/deploy
      as access permits, inspect results and exercise the actual endpoint.
- [ ] Change DNS only after production TLS and real-flow acceptance succeed.
      Record exact external blockers if AWS bootstrap or domain access is absent.
