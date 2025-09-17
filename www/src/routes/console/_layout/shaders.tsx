"use client";

import { createFileRoute } from "@tanstack/react-router";
import { MeshGradient, DotOrbit } from "@paper-design/shaders-react";

export const Route = createFileRoute("/console/_layout/shaders")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <MeshGradient
        colors={["#373e9d", "#007BFF", "#E3F4FF", "#DFF0F0"]}
        distortion={1}
        swirl={0.8}
        speed={0.6}
        style={{ width: 200, height: 200 }}
      />
    </>
  );
}
