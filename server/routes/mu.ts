"use strict";

import Router = require("koa-router");
const router = new Router();
import { shadowsocksMuToken } from "../lib/config";
import { connection } from "../lib/db";
import User from "../models/user";

router.get("/users", async (ctx) => {
  if ((ctx.request.header.token || ctx.request.query.key) !== shadowsocksMuToken) {
    ctx.throw(401);
  } else {
    const users = await connection.getRepository(User).find();
    const data = [];
    for (const user of users) {
      data.push({
        id: user.id,
        email: user.email,
        passwd: user.connPassword,
        t: user.updatedAt.getTime(),
        u: 0,
        d: 0,
        transfer_enable: 200000000,
        port: user.connPort,
        switch: user.enabled ? 1 : 0,
        enable: user.enabled ? 1 : 0,
        method: user.connEnc,
      });
    }
    ctx.response.set("Content-Type", "application/json");
    ctx.response.body = JSON.stringify({
      msg: "ok",
      data,
    });
  }
});
router.post("/users/:id/traffic", async (ctx) => {
  if ((ctx.request.header.token || ctx.request.query.key) !== shadowsocksMuToken) {
    ctx.throw(401);
  } else {
    const user = await connection.getRepository(User).findOneById(ctx.params.id);
    if (!user) {
      ctx.throw(404);
    } else if ((!ctx.request.body.u) && (!ctx.request.body.d)) {
      ctx.throw(400);
    } else {
      user.updatedAt = new Date();
      await connection.getRepository(User).save(user);
      ctx.response.set("Content-Type", "application/json");
      ctx.response.body = JSON.stringify({
        ret: 1,
        msg: "ok",
      });
    }
  }
});

export default router;
