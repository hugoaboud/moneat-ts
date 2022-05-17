# moneat-ts
##### Multi-Objective NeuroEvolution of Augmenting Topologies, implemented with TypeScript.

This library aims to implement a modified version of [NEAT](http://nn.cs.utexas.edu/downloads/papers/stanley.ec02.pdf), along with a modified version of [NSGA-II](https://ieeexplore.ieee.org/document/996017) to achieve Multi-Objective evolution of Neural Networks.

### Warning

> ! This is a work in progress !

I'm having trouble with inconsistent behaviour, where the XOR example will fail or perform poorly every other attempt. Still working on the test coverage to further investigate the issue.

If you'd like to help don't hesitate cloning the project, taking a look around, implementing some of the described tests, etc. Also feel free to open Issues and PRs.

The current version doesn't implement NSGA-II, the goal is getting the original NEAT reproduction method working before adding more layers to the problem. However, a working version of NEAT+NSGA-II can be found [here](https://github.com/hugoaboud/neat-python).

### Setup

Install node dependencies:

```bash
yarn
``` 

There are a few examples available on the `examples/` folder. To run them, you can use the CLI:

```bash
yarn cli
``` 

To run the tests:

```bash
yarn test
```