import { createId } from "@paralleldrive/cuid2";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export function registerRequestIdHook(fastify: FastifyInstance): void {
  fastify.addHook("onRequest", async (request: FastifyRequest, reply: FastifyReply) => {
    const headerRequestId = request.headers["x-request-id"];
    const requestId =
      typeof headerRequestId === "string" && headerRequestId.length > 0
        ? headerRequestId
        : createId();

    request.headers["x-request-id"] = requestId;
    reply.header("x-request-id", requestId);
  });
}
