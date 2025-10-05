Custom node
===============

Purpose
-------
The Custom node builds a JSON object that contains two keys:

- `attributes`: key/value pairs (all values stored as strings)
- `methods`: map of method name -> { language, code }

This format is intentionally simple so downstream Function (JS) or Python nodes can consume and execute the code strings. The node does not evaluate code by itself — it stores method bodies as strings with a language tag.

Usage examples
--------------

1) Create attributes and methods in the Custom node.
2) Use a Function node (JavaScript) to execute a JS method:

```js
// item.json.custom contains the object exported by the Custom node
const custom = items[0].json.custom;
const attrs = custom.attributes;
const methods = custom.methods;

// Example: execute a JS method named 'greet' (method.code is the function body)
const fnBody = methods.greet.code; // e.g. "return `Hello ${name}`;"
const fn = new Function('attrs', 'input', fnBody);
const result = fn(attrs, items[0].json);
return [{ json: { result } }];
```

3) Use a Python node to run a Python method (method.code should be a function body expecting attrs/input):

```python
# assuming `item['json']['custom']` provided
custom = item['json']['custom']
methods = custom['methods']
code = methods['compute']['code']

# build a function wrapper and exec
exec_env = {}
exec(f"def _fn(attrs, input):\n" + "\n".join(["    " + line for line in code.split('\n')]), exec_env)
result = exec_env['_fn'](custom['attributes'], item['json'])
return {'result': result}
```

Notes
-----
- The node stores everything as strings; convert types as needed in downstream nodes.
- Keep method bodies small and safe—executing arbitrary code has security implications.
