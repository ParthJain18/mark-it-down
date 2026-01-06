# Markdown Formatting Test

This is a comprehensive test document to verify all markdown formatting features work correctly.

## Text Formatting

This is **bold text** and this is *italic text*. You can also combine them: ***bold and italic***.

Here's some ~~strikethrough text~~ and `inline code`.

## Headings

# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6

## Lists

### Unordered List
- First item
- Second item
  - Nested item 1
  - Nested item 2
- Third item

### Ordered List
1. First item
2. Second item
   1. Nested item 1
   2. Nested item 2
3. Third item

### Task List
- [ ] Unchecked task
- [x] Completed task
- [ ] Another task to do
  - [x] Nested completed task
  - [ ] Nested unchecked task

## Links

Here's a [link to Google](https://www.google.com) and here's [another link](https://github.com).

## Blockquotes

> This is a blockquote.
> It can span multiple lines.
>
> And even have multiple paragraphs.

## Code Blocks

Inline code: `const greeting = "Hello, World!";`

Code block:

```javascript
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10));
```

```python
def hello_world():
    print("Hello, World!")
    return True

hello_world()
```

## Tables

| Feature | Status | Priority |
|---------|--------|----------|
| Dark Mode | ✅ Complete | High |
| Auto-save | ✅ Complete | High |
| File Explorer | ✅ Complete | High |
| Image Paste | ✅ Complete | Medium |

## Horizontal Rule

---

## Mixed Content

You can mix **bold**, *italic*, `code`, and [links](https://example.com) in the same sentence.

### Task Management Example

Project Setup:
- [x] Initialize repository
- [x] Install dependencies
- [x] Configure environment
- [ ] Write tests
  - [x] Unit tests
  - [ ] Integration tests
  - [ ] E2E tests
- [ ] Deploy to production

### Code Example with Explanation

Here's a simple React component:

```jsx
import React, { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}
```

The component above demonstrates:
1. **State management** with `useState`
2. **Event handling** with `onClick`
3. **JSX syntax** for rendering

## Nested Lists and Complex Formatting

1. **First main item** - This is important
   - Sub-item with *italic*
   - Another sub-item with `code`
     1. Deeply nested ordered item
     2. Another deep item
   - Back to bullets
2. **Second main item**
   > With a blockquote inside
   
   And some regular text
3. **Third main item**
   ```js
   // With a code block
   const x = 42;
   ```

## Special Characters and Symbols

- Math: α, β, γ, Δ, π, Σ, ∞
- Arrows: →, ←, ↑, ↓, ⇒, ⇐
- Checkmarks: ✓, ✗, ✅, ❌
- Stars: ★, ☆, ⭐
- Currency: $, €, £, ¥

## Image Placeholder

*Note: You can paste images directly into the editor with Ctrl+V or Cmd+V*

To test image pasting:
1. Copy an image to your clipboard
2. Click in the editor
3. Press Ctrl+V (or Cmd+V on Mac)
4. The image should appear inline

---

## Summary

This document tests:
- ✅ Headers (H1-H6)
- ✅ Text formatting (bold, italic, strikethrough)
- ✅ Lists (ordered, unordered, nested)
- ✅ Task lists with checkboxes
- ✅ Links
- ✅ Blockquotes
- ✅ Code blocks with syntax highlighting
- ✅ Tables
- ✅ Horizontal rules
- ✅ Mixed formatting
- ✅ Special characters

**All formatting should render properly in the live preview!**
