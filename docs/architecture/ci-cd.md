# Fishbowl AI - Electron CI/CD Architecture

See the [monorepo architecture guide](./monorepo.md) for an overview of the project structure and technology stack.

## CI/CD with CircleCI

Sample CircleCI configuration for building and testing the Fishbowl AI applications across desktop and mobile platforms.

**.circleci/config.yml**

```yaml
version: 2.1

orbs:
  node: circleci/node@5.1.0
  android: circleci/android@2.0.0
  macos: circleci/macos@2.0.0

executors:
  node-executor:
    docker:
      - image: cimg/node:20.10.0
  macos-executor:
    macos:
      xcode: 15.0.0
    resource_class: macos.m1.medium.gen1

jobs:
  install-dependencies:
    executor: node-executor
    steps:
      - checkout
      - restore_cache:
          keys:
            - pnpm-deps-{{ checksum "pnpm-lock.yaml" }}
      - run:
          name: Install pnpm
          command: npm install -g pnpm
      - run:
          name: Install dependencies
          command: pnpm install --frozen-lockfile
      - save_cache:
          key: pnpm-deps-{{ checksum "pnpm-lock.yaml" }}
          paths:
            - node_modules
            - ~/.pnpm-store

  test-shared:
    executor: node-executor
    steps:
      - checkout
      - attach_workspace:
          at: .
      - run:
          name: Run shared package tests
          command: pnpm test --filter=@fishbowl-ai/shared

  build-desktop-linux:
    executor: node-executor
    steps:
      - checkout
      - attach_workspace:
          at: .
      - run:
          name: Install Rust
          command: |
            curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
            source $HOME/.cargo/env
      - run:
          name: Install system dependencies
          command: |
            sudo apt-get update
            sudo apt-get install -y webkit2gtk-4.0 libgtk-3-dev libappindicator3-dev
      - run:
          name: Build desktop app
          command: pnpm build:desktop

  build-desktop-macos:
    executor: macos-executor
    steps:
      - checkout
      - attach_workspace:
          at: .
      - run:
          name: Install Rust
          command: |
            curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
            source $HOME/.cargo/env
      - run:
          name: Build desktop app
          command: pnpm build:desktop

  test-e2e-desktop:
    executor: node-executor
    steps:
      - checkout
      - attach_workspace:
          at: .
      - run:
          name: Run desktop E2E tests
          command: pnpm test:e2e:desktop

workflows:
  build-and-test:
    jobs:
      - install-dependencies
      - test-shared:
          requires:
            - install-dependencies
      - build-desktop-linux:
          requires:
            - test-shared
      - build-desktop-macos:
          requires:
            - test-shared
      - test-e2e-desktop:
          requires:
            - build-desktop-linux
```
