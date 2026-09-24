export function respond(res, result) {
    res.status(result.status).render(result.view, result.locals);
}
