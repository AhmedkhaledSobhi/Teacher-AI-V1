# Multiple Select Implementation Guide

## Overview

This guide explains the proper way to implement multiple selection components in this project, based on the existing patterns and best practices.

## Two Approaches for Multiple Selection

### 1. CustomTextField with `multiple: true` (Recommended)

This is the **preferred approach** used throughout the project for multiple selection.

#### Basic Implementation

```typescript
<CustomTextField
  select
  fullWidth
  label="Select Items"
  value={selectedValues}
  slotProps={{
    select: {
      multiple: true,
      onChange: (e) => setSelectedValues(e.target.value),
      renderValue: (selected) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {(selected as string[]).map((value) => (
            <Chip
              key={value}
              size="small"
              label={value}
              onDelete={() => handleDelete(value)}
              onMouseDown={(e) => e.stopPropagation()}
            />
          ))}
        </Box>
      ),
    },
  }}
>
  {options.map((option) => (
    <MenuItem key={option.value} value={option.value}>
      {option.label}
    </MenuItem>
  ))}
</CustomTextField>
```

#### With React Hook Form

```typescript
<Controller
  name="fieldName"
  control={control}
  render={({ field }) => (
    <CustomTextField
      {...field}
      select
      fullWidth
      label="Select Items"
      slotProps={{
        select: {
          multiple: true,
          value: field.value || [],
          onChange: (e) => field.onChange(e.target.value),
          renderValue: (selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {(selected as number[]).map((value) => {
                const option = options.find(o => o.value === value);
                return (
                  <Chip
                    key={value}
                    size="small"
                    label={option?.name || `Item ${value}`}
                    onDelete={() => {
                      const newValue = (selected as number[]).filter(item => item !== value);
                      field.onChange(newValue);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                  />
                );
              })}
            </Box>
          ),
        },
      }}
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          <Box display="flex" alignItems="center" gap={2}>
            <Icon />
            <Typography>{option.name}</Typography>
          </Box>
        </MenuItem>
      ))}
    </CustomTextField>
  )}
/>
```

### 2. CustomAutocomplete with `multiple: true` (Alternative)

This approach is used in fewer places but can be useful for complex scenarios.

#### Basic Implementation

```typescript
<CustomAutocomplete
  multiple
  options={options}
  value={selectedValues}
  onChange={(_, newValue) => setSelectedValues(newValue)}
  getOptionLabel={(option) => option.name}
  isOptionEqualToValue={(option, value) => option.value === value.value}
  renderInput={(params) => (
    <CustomTextField
      {...params}
      label="Select Items"
      placeholder="Choose items..."
    />
  )}
  renderTags={(value, getTagProps) =>
    value.map((option, index) => (
      <Chip
        {...getTagProps({ index })}
        key={option.value}
        label={option.name}
        size="small"
      />
    ))
  }
  renderOption={(props, option) => {
    const { key, ...otherProps } = props;
    return (
      <Box component="li" key={key} {...otherProps}>
        <Box display="flex" alignItems="center" gap={2}>
          <Icon />
          <Typography>{option.name}</Typography>
        </Box>
      </Box>
    );
  }}
/>
```

## Key Differences

| Feature | CustomTextField | CustomAutocomplete |
|---------|----------------|-------------------|
| **Complexity** | Simple | More complex |
| **Performance** | Better | Good |
| **Styling** | Easier to customize | More flexible |
| **Search** | No built-in search | Built-in search |
| **Project Usage** | Widely used | Limited usage |
| **Maintenance** | Easier | More complex |

## Best Practices

### 1. Always Use `onMouseDown={(e) => e.stopPropagation()}`

This prevents the dropdown from closing when clicking on chips:

```typescript
<Chip
  onMouseDown={(e) => e.stopPropagation()}
  onDelete={() => handleDelete(value)}
/>
```

### 2. Proper Key Handling

For CustomAutocomplete, always extract the key prop:

```typescript
renderOption={(props, option) => {
  const { key, ...otherProps } = props;
  return (
    <Box component="li" key={key} {...otherProps}>
      {/* content */}
    </Box>
  );
}}
```

### 3. Value Management

Always provide default values to prevent undefined errors:

```typescript
value={field.value || []}
```

### 4. Chip Styling

Use consistent styling for chips:

```typescript
<Chip
  size="small"
  color="primary"
  variant="outlined"
  sx={{
    borderRadius: "8px",
    backgroundColor: "primary.light",
    color: "primary.main",
    border: "1px solid",
    borderColor: "primary.main",
  }}
/>
```

## Common Patterns in the Project

### 1. Account Settings (Language Selection)

```typescript
<CustomTextField
  select
  fullWidth
  label='Language'
  value={language}
  slotProps={{
    select: {
      multiple: true,
      onChange: handleChange,
      renderValue: selected => (
        <div className='flex flex-wrap gap-2'>
          {(selected as string[]).map(value => (
            <Chip
              key={value}
              clickable
              onMouseDown={event => event.stopPropagation()}
              size='small'
              label={value}
              onDelete={() => handleDelete(value)}
            />
          ))}
        </div>
      )
    }
  }}
>
  {languageData.map(name => (
    <MenuItem key={name} value={name}>
      {name}
    </MenuItem>
  ))}
</CustomTextField>
```

### 2. Kanban Labels

```typescript
<CustomTextField
  select
  label='Label'
  slotProps={{
    select: {
      multiple: true,
      value: badgeText || [],
      onChange: e => setBadgeText(e.target.value as string[]),
      renderValue: selected => (
        <div className='flex flex-wrap gap-1'>
          {(selected as string[]).map(value => (
            <Chip
              variant='tonal'
              key={value}
              size='small'
              onMouseDown={e => e.stopPropagation()}
              label={value}
              color={chipColor[value]?.color}
              onDelete={() => setBadgeText(current => current.filter(item => item !== value))}
            />
          ))}
        </div>
      )
    }
  }}
>
  {Object.keys(chipColor).map(chip => (
    <MenuItem key={chip} value={chip}>
      <Checkbox checked={badgeText && badgeText.indexOf(chip) > -1} />
      <ListItemText primary={chip} />
    </MenuItem>
  ))}
</CustomTextField>
```

## Migration from CustomAutocomplete to CustomTextField

If you need to migrate from CustomAutocomplete to CustomTextField:

1. **Remove CustomAutocomplete import**
2. **Replace with CustomTextField**
3. **Add `select` and `multiple: true` props**
4. **Implement `renderValue` for chip display**
5. **Convert options to MenuItem components**
6. **Update onChange handler**

## Troubleshooting

### Common Issues

1. **Dropdown closes when clicking chips**: Add `onMouseDown={(e) => e.stopPropagation()}`
2. **React key warnings**: Extract key prop before spreading
3. **Undefined values**: Provide default empty array `|| []`
4. **Styling issues**: Use consistent sx props for chips

### Performance Tips

1. **Use CustomTextField for simple cases**
2. **Memoize options array if it's large**
3. **Use proper keys for list items**
4. **Avoid unnecessary re-renders**

## Conclusion

The **CustomTextField with `multiple: true`** approach is the recommended pattern for this project. It's simpler, more performant, and widely used throughout the codebase. Use CustomAutocomplete only when you need advanced features like built-in search functionality.
