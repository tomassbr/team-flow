// Users API is not yet implemented.
// Return 501 Not Implemented for all methods until it is.
const NOT_IMPLEMENTED = Response.json(
  { error: "Not implemented" },
  { status: 501 }
);

export function GET() {
  return NOT_IMPLEMENTED;
}

export function POST() {
  return NOT_IMPLEMENTED;
}

export function DELETE() {
  return NOT_IMPLEMENTED;
}
