import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { Button } from "../Button"

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole("button", { name: "Click me" })).toBeDefined()
  })

  it("shows spinner when loading", () => {
    render(<Button loading>Loading</Button>)
    expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true")
  })
})
