# Components

The components below are exported from `@/components`.

### Btn

- `as?`: React element type; defaults to `button`
- `variant?`: `primary | secondary | ghost | danger | terminal`; defaults to `primary`
- `size?`: `sm | md | lg`; defaults to `md`
- `className?`
- Props from the element selected with `as`

```tsx
<Btn variant="primary" size="md">
  Click me
</Btn>
```

### Container

- `variant?`: `default | panel | terminal`; defaults to `default`
- `label?`
- `className?`
- Native div props

```tsx
<Container variant="panel" label="Info">
  <Text>Content here</Text>
</Container>
```

### Input

- `variant?`: `default | ghost`; defaults to `default`
- `label?`
- `error?`
- `className?`: applied to the input wrapper
- Native input props
- Supports a forwarded ref to the native input.

```tsx
<Input label="Username" placeholder="Enter username" />
```

### Alert

- `variant?`: `info | success | warning | error`; defaults to `info`
- `tag?`: overrides the default status tag
- `hidable?`: shows a close button when `true`
- `onHide?`: called after the alert is hidden
- `className?`
- Native div props

```tsx
<Alert variant="success" hidable>
  Operation successful!
</Alert>
```

### Heading

- `level?`: `1 | 2 | 3 | 4 | 5`; defaults to `1`
- `className?`
- Native heading props

```tsx
<Heading level={1}>Main title</Heading>
```

### Text

- `variant?`: `default | dim | muted | accent | error | prompt`; defaults to `default`
- `size?`: `xs | sm | base`; defaults to `sm`
- `as?`: `p | span | label | li`; defaults to `p`
- `className?`
- Native HTML props

```tsx
<Text as="span" variant="dim" size="sm">
  Some text
</Text>
```

### Label

- `htmlFor?`
- `className?`
- Native HTML props

```tsx
<Label htmlFor="field">Field label</Label>
```

### AuthForm

- `mode?`: `login | register`; defaults to `login`
- `error?`
- `loading?`; defaults to `false`
- `onSubmit?`: receives `{ identifier?, username?, password }`

```tsx
<AuthForm mode="login" onSubmit={(data) => handleAuth(data)} />
```

### List

- Each item must have an `id: string | number`.
- `items`
- `renderItem`: receives the item and its index
- `className?`
- `containerVariant?`: `default | panel | terminal`
- `getItemClassName?`: receives the item and its index

```tsx
<List items={users} renderItem={(user) => <div>{user.name}</div>} />
```

### StatCard

- `label?`
- `children`
- `variant?`: `default | panel | terminal | null`; `null` uses `default`

```tsx
<StatCard label="Statistics">
  <StatItem label="Rank" value="#42" accent />
  <StatDivider />
  <StatItem label="Score" value="100" />
</StatCard>
```

### StatItem

- `label`
- `value`: `string | number`
- `accent?`; defaults to `false`

```tsx
<StatItem label="Wins" value={42} />
```

### StatDivider

```tsx
<StatDivider />
```

### Avatar

- `username`
- `src?`: `string | null`
- `size?`: `sm | md | lg | xl`; defaults to `md`
- `className?`
- Displays the first letter of `username` when `src` is absent.

```tsx
<Avatar username="john" size="md" />
```

### TextArea

- `variant?`: `default | ghost`; defaults to `default`
- `label?`
- `error?`
- `className?`: applied to the native textarea
- `rows?`; defaults to `4`
- Native textarea props
- Supports a forwarded ref to the native textarea.

```tsx
<TextArea label="Message" placeholder="Type here" rows={4} />
```

### Pagination

- `currentPage`
- `totalPages`
- `onPageChange`: receives the selected page number
- `className?`

```tsx
<Pagination
  currentPage={1}
  totalPages={5}
  onPageChange={(page) => setPage(page)}
/>
```

### Status

- `status`: string; `ONLINE`, `IN_GAME`, and `OFFLINE` have defined colors, and other values use the offline color
- `hoverText?`: rendered as the native `title`

```tsx
<Status status="ONLINE" hoverText="User is online" />
```

### LanguageSwitcher

- `variant?`: `navbar | settings`; defaults to `navbar`

```tsx
<LanguageSwitcher variant="navbar" />
```

### Modal

- `isOpen`
- `onClose`
- `title?`
- `className?`: applied to the dialog panel
- `children`
- Closes on a backdrop click or the Escape key.

```tsx
<Modal isOpen={open} onClose={() => setOpen(false)} title="Confirm">
  <Text>Are you sure?</Text>
</Modal>
```

### SearchList

- Each result must have an `id: string | number`.
- `fetchFn`: receives the query and page, then returns `{ data, totalPages }`
- `renderItem`
- `placeholder?`
- `emptyMessage?`
- `debounceMs?`; defaults to `300`
- `className?`
- `excludeUsername?`: filters results whose `username` matches this value

```tsx
<SearchList
  fetchFn={searchUsers}
  renderItem={(user) => <span>{user.username}</span>}
  excludeUsername={currentUsername}
/>
```

### ProgressBar

- `value`
- `label?`
- `max?`; defaults to `100`
- `color?`: `accent | dim | default | darkgreen | error | muted`
- Only `accent` selects the accent style. All other accepted values use the default style.

```tsx
<ProgressBar value={75} max={100} label="Progress" color="accent" />
```

### Footer

```tsx
<Footer />
```

### Navbar

```tsx
<Navbar />
```

### PageLayout

- `children`
- `maxWidth?`: a CSS utility class such as `max-w-md`
- `centerY?`; defaults to `false`

```tsx
<PageLayout maxWidth="max-w-md" centerY>
  <Heading level={1}>Title</Heading>
</PageLayout>
```

### PageWithSidebar

- `children`
- `sidebar`
- `maxWidth?`: a CSS utility class
- `fillHeight?`
- `sidebarFull?`: changes sidebar scrolling when `fillHeight` is enabled
- `centerContent?`: balances the sidebar with an empty column on extra-large screens

```tsx
<PageWithSidebar sidebar={<Sidebar>Menu</Sidebar>}>
  <div>Main content</div>
</PageWithSidebar>
```

### Sidebar

- `children`
- `variant?`: `default | panel | terminal | null`; `null` uses `default`

```tsx
<Sidebar variant="default">
  <Text>Sidebar content</Text>
</Sidebar>
```
