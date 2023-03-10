#!/usr/bin/env node
import "source-map-support/register"
import * as cdk from "aws-cdk-lib"
import { ToDoStack } from "../lib/todo-stack"

const app = new cdk.App()
new ToDoStack(app, "ToDoStack", {})
