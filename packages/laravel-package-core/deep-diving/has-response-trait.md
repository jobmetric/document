---
sidebar_position: 11
sidebar_label: Controller Response Helpers
---

# Controller Response Helpers

`JobMetric\PackageCore\Controllers\HasResponse` is a controller trait for standardizing JSON responses across endpoints.

## Core Methods

### response

Formats a single-item JSON response with optional message, status override, and additional metadata.  
Use this when returning create/update/show results that are not resource collections.

```php
return $this->response(
    ['data' => $category],
    'Category created successfully',
    201
);
```

### responseCollection

Formats collection/resource responses while preserving Laravel resource metadata behavior.  
Use this for paginated lists and resource collections where you still need custom message or status.

```php
return $this->responseCollection(
    $categories,
    'Category list loaded',
    200,
    ['trace_id' => request()->header('X-Trace-Id')]
);
```

## Example

```php
use JobMetric\PackageCore\Controllers\HasResponse;

class CategoryTestController extends Controller
{
    use HasResponse;

    public function store(Request $request): JsonResponse
    {
        $result = Category::store($request->all());
        return $this->response($result);
    }
}
```

## Best Practices

- Use a consistent response pattern across API controllers
- Use `additional` for shared metadata (`trace_id`, `version`, etc.)
- Override message/status in HTTP-facing layers only
