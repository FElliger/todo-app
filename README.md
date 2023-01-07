# A ToDo list

This is just another todo list application. It's main purpose is for me to play around with some tech. So, this is not super clean nor really production-ready code. I put this on GitHub to have it somewhere. However, if you find anything meaningful in here, I'd be happy to learn about it.

## What's in it

At the moment, this is a Svelte front-end backed by what is intended to be an API running on AWS API Gateway + Lambda + DynamoDB. 

- `backend` - holds the code for Lambda functions + the dev backend
- `infra` - holds the infrastructure definitions as code. This uses CDK.
- `frontend` - holds the Svelte frontend (no SvelteKit; just client-side rendering)

From a tooling perspective, this uses `eslint` and `prettier` for linting and formatting.

## Quick Start

This quick start assumes you have Docker set up with support for docker-compose. It further assumes that you run docker without `sudo`. Lastly, it assumes that your AWS `default` profiles specifies a region or `AWS_REGION` is set as an env var.
To get going with this application, clone the repo and run

```bash
npm run setup:all
npm run dev
```  

## Local execution

The local execution uses Express to standup a back-end server (file: `backend/dev-server.ts`) and a [local DynamoDB via Docker](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html). The vite dev server forwards `/api` to the Express server which mimics how Cloudfront would work.

As the API Gateway API is envisioned to have a single "proxy all" resource, the Express dev server does a very simple mapping of it's request/response objects to API Gateway's data structures. The mapping is (very very very) far from complete, but serves the purpose of this play project.  
 

### Why not AWS SAM Local?

I tried it and I failed. I believe it's due to the ARM architecture of the Chromebook I am mainly using for playing around with this. There was some docker error when I tried launching the Lambda containers. My research brought me to this [SAM issue](https://github.com/aws/aws-sam-cli/issues/3169) from where I concluded that I can't make it work on this machine. 

## How to deploy

To deploy this into an actual AWS account run

```bash
npm run build:all
cd cdk
npm run cdk deploy
```

## What I've learned

When starting this, I wanted to do some "front-end stuff". I achieved that for sure, but I also spent a lot on backend and tooling topics. Not quite what I had in mind when starting, but it was valuable. Here are some of my takeaways from playing around.

### Routing frameworks/components really do a lot of heavy lifting

That's obviously no surprise. But spending some time on writing simplistic code for handling some routing based on path and request method really makes me admire their work even more. The simplicity of just annotating a method with stuff like `@Get("/todos/{todoId")` is really intriguing. Not to mention all the standard error handling for unknown paths, unsupported HTTP methods, etc. The routing I implemented works (at least locally for now), but if time permits I'd like to see whether I could reuse some existing routing component in this Lambda implementation.

### A local fullstack experience is a big win

Probably no suprise again. But coming from working in an environment where "just deploy it to your sandbox account" is cheap, it was refreshing to not rely on this comfort while playing with this todo list. And it might add some more effort to the development, but the turnaround is a lot quicker when all things can be run and tested locally.

### Testing without mocks is a valuable exercise

I have been using mocks for a lot of years. They also helped me understand the value of testability and dependency injection. However, I came across an [article on "Testing without Mocks"](https://www.jamesshore.com/v2/projects/testing-without-mocks/testing-without-mocks) that made me curious to play with the idea. I still feel like I re-implemented some of what mocking would do, but the exercise brought some intesting results. 

Most notably, I implemented a very simplistic in-memory DynamoDB that has enough functionality to support this application. For sure, it doesn't have the full DDB feature set. But, in theory, I could run the application locally without the local DDB but just my simplistic in-memory one. It adds some risk that the calls to an actual DynamoDB would behave differently, but that's where integration tests would come into play. 

In general, testing without mocks helped me think a bit more about what some service does internally, and how one could implement it.

## What's next - my personal todo list for this todo list

I could manage that in the todo list itself, but I'm not sure it will run anywhere for a longer time. So I'm keeping this here. In general, there are a lot of holes in the implementation that are worth addressing. I'd also like to improve the tooling around the repo, such as a GitHub workflow and pre-push hook.

### Tests

Lots of tests that could still be written. The back-end has some, but not a lot. So in order of priority:

1. Unit tests for front-end components
2. E2E tests that automate the front-end (cypress?)
3. API integration tests (maybe via Postman?)
4. More complete backend unit tests (I don't think I'll ever get here, though)

### More front-end fun

You can read it as a feature wish-list. Keep in mind that the purpose of this is to learn and play. So, the features might not bring a lot of value, but could be fun to think and play through.

1. Edit/delete todos - pretty basic functionality
2. Group todos in self-named groups (e.g. "Work", "At Home", "Pet") - also allow fancy layout switch
3. Authentication - bring this beyond demo mode
4. Enhanced styling - just to play around with whatever (flexibly layout, animations maybe, other eye-candy)

