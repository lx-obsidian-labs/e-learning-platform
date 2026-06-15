const { createClient } = require("@supabase/supabase-js")
const { config } = require("dotenv")
const path = require("path")
const { randomUUID } = require("crypto")

config({ path: path.resolve(__dirname, "..", ".env") })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) { console.error("Missing SUPABASE env vars"); process.exit(1) }

const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })

function slugify(t) { return t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") }

const COURSES = [
  {
    title: "HTML & CSS Mastery",
    description: "Master modern HTML5 and CSS3 from the ground up. Build responsive, accessible websites with flexbox, grid, custom properties, and animations. Perfect for absolute beginners and those wanting to solidify their foundation.",
    category: "Web Development",
    isFree: true,
    modules: [
      {
        title: "HTML5 Fundamentals",
        lessons: [
          { title: "Introduction to HTML", duration: 25, videoUrl: "https://www.youtube.com/watch?v=pQN-pnXPaVg", content: "<p>HTML (HyperText Markup Language) is the backbone of every website. It provides the structure and meaning to web content by using a system of tags and attributes.</p><p>In this lesson, we will explore the history of HTML, understand how it evolved from HTML 1.0 to HTML5, and learn why semantic markup matters for accessibility and SEO.</p><p>Every HTML document follows a basic template: a doctype declaration, html element, head section with metadata, and body with visible content. We will build our first page together.</p>" },
          { title: "Semantic Elements & Structure", duration: 30, videoUrl: "https://www.youtube.com/watch?v=QGvlG2DeTfo", content: "<p>Semantic HTML elements clearly describe their meaning to both the browser and the developer. Elements like header, nav, main, article, section, and footer provide structure and improve accessibility.</p><p>Using semantic elements helps screen readers navigate content, improves SEO rankings, and makes code easier to read and maintain. We will refactor a div-based layout into a semantic one.</p>" },
          { title: "Forms & Input Validation", duration: 35, videoUrl: "https://www.youtube.com/watch?v=2O8pkybH6po", content: "<p>HTML forms are essential for collecting user input. Learn to create text fields, checkboxes, radio buttons, select menus, and textareas with proper labels and accessibility attributes.</p><p>HTML5 introduced built-in form validation attributes like required, pattern, min, max, and type-specific validation for email, url, and number inputs. We will build a complete registration form.</p>" },
          { title: "Multimedia & Embedding", duration: 20, videoUrl: "https://www.youtube.com/watch?v=3PHXvlpOkf4", content: "<p>Add images, audio, video, and embedded content to your web pages. The img element with srcset and sizes attributes enables responsive images. The picture element provides art direction.</p><p>HTML5 introduced native video and audio elements with support for multiple formats and full control via JavaScript. Learn about iframes for embedding external content like maps and videos.</p>" }
        ],
        quiz: {
          title: "HTML5 Fundamentals Quiz",
          passingScore: 70,
          questions: [
            { text: "Which HTML element is used to define the navigation links?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "nav", isCorrect: true }, { text: "navigation", isCorrect: false }, { text: "menu", isCorrect: false }, { text: "links", isCorrect: false }] },
            { text: "What does the 'required' attribute do on an input element?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Makes the field mandatory before form submission", isCorrect: true }, { text: "Adds a red border to the field", isCorrect: false }, { text: "Prevents the field from being edited", isCorrect: false }, { text: "Automatically fills the field with sample text", isCorrect: false }] },
            { text: "Which element is used to embed an external web page?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "iframe", isCorrect: true }, { text: "embed", isCorrect: false }, { text: "object", isCorrect: false }, { text: "frame", isCorrect: false }] },
            { text: "What is the purpose of semantic HTML?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "To give meaning to web content for accessibility and SEO", isCorrect: true }, { text: "To make web pages load faster", isCorrect: false }, { text: "To add visual styling to elements", isCorrect: false }, { text: "To encrypt data sent between server and client", isCorrect: false }] }
          ]
        }
      },
      {
        title: "CSS3 Styling & Layout",
        lessons: [
          { title: "CSS Selectors & Specificity", duration: 30, videoUrl: "https://www.youtube.com/watch?v=1PnVor36_40", content: "<p>CSS selectors define which elements to style. Learn about element selectors, class selectors, ID selectors, attribute selectors, pseudo-classes, and pseudo-elements.</p><p>Understanding specificity and the cascade is crucial for writing maintainable CSS. We will explore how the browser calculates specificity and how to use the cascade to your advantage.</p>" },
          { title: "Flexbox Layout", duration: 35, videoUrl: "https://www.youtube.com/watch?v=JJSoEo8OcU", content: "<p>Flexbox is a one-dimensional layout model that provides powerful alignment and distribution capabilities. Learn about flex containers, flex items, main axis, cross axis, and alignment properties.</p><p>Build a responsive navigation bar, a card layout, and a centered hero section using flexbox. Understand shorthand properties and common patterns.</p>" },
          { title: "CSS Grid Layout", duration: 35, videoUrl: "https://www.youtube.com/watch?v=9zBz6dx1bLg", content: "<p>CSS Grid is a two-dimensional layout system that handles rows and columns simultaneously. Define grid containers, explicit and implicit grids, grid lines, areas, and gaps.</p><p>Create complex layouts like magazine-style pages, dashboard interfaces, and responsive galleries. Learn about fractional units, minmax, auto-fit, and auto-fill.</p>" },
          { title: "Responsive Design & Media Queries", duration: 25, videoUrl: "https://www.youtube.com/watch?v=srvUrASc0NQ", content: "<p>Responsive design ensures your website looks great on every device. Learn the principles of fluid layouts, flexible images, and CSS media queries.</p><p>Use mobile-first approach, breakpoints, and relative units like rem, em, vw, and vh. Test your designs across multiple screen sizes and devices.</p>" },
          { title: "CSS Animations & Transitions", duration: 30, videoUrl: "https://www.youtube.com/watch?v=YszONjKpgg4", content: "<p>Bring your websites to life with CSS transitions and animations. Learn to animate properties with transition timing functions, delays, and triggers.</p><p>Create keyframe animations with multiple steps, direction control, fill modes, and iteration counts. Build hover effects, loading spinners, and entrance animations.</p>" }
        ],
        quiz: {
          title: "CSS3 Styling & Layout Quiz",
          passingScore: 70,
          questions: [
            { text: "Which CSS property creates space between flex items?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "gap", isCorrect: true }, { text: "margin", isCorrect: false }, { text: "padding", isCorrect: false }, { text: "space-between", isCorrect: false }] },
            { text: "What does the 'fr' unit represent in CSS Grid?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "A fraction of the available space", isCorrect: true }, { text: "A fixed pixel value", isCorrect: false }, { text: "A percentage of the viewport", isCorrect: false }, { text: "A font-relative unit", isCorrect: false }] },
            { text: "Which pseudo-class selects an element when hovered?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: ":hover", isCorrect: true }, { text: ":active", isCorrect: false }, { text: ":focus", isCorrect: false }, { text: ":visited", isCorrect: false }] }
          ]
        }
      }
    ]
  },
  {
    title: "JavaScript Fundamentals",
    description: "Learn JavaScript from scratch - variables, functions, objects, arrays, closures, promises, and async/await. Build interactive web applications with the world's most popular programming language.",
    category: "Web Development",
    isFree: true,
    modules: [
      {
        title: "Core JavaScript Concepts",
        lessons: [
          { title: "Variables, Data Types & Operators", duration: 30, videoUrl: "https://www.youtube.com/watch?v=W6NZfCO5SIk", content: "<p>JavaScript has dynamic typing with primitive types: string, number, boolean, null, undefined, symbol, and bigint. Learn how to declare variables using var, let, and const with their scoping rules.</p><p>Operators include arithmetic, assignment, comparison, logical, and ternary. Understand type coercion and strict equality vs loose equality.</p>" },
          { title: "Functions & Scope", duration: 35, videoUrl: "https://www.youtube.com/watch?v=W6NZfCO5SIk", content: "<p>Functions are first-class citizens in JavaScript. Learn function declarations, expressions, arrow functions, default parameters, rest parameters, and the arguments object.</p><p>Understand global scope, function scope, block scope with let/const, and lexical scoping. Closures allow functions to retain access to their lexical environment.</p>" },
          { title: "Objects & Prototypes", duration: 30, videoUrl: "https://www.youtube.com/watch?v=W6NZfCO5SIk", content: "<p>Objects are collections of key-value pairs. Learn object literal syntax, computed properties, shorthand methods, property descriptors, getters and setters.</p><p>JavaScript uses prototypal inheritance. Every object has a prototype chain. Learn how to create objects with Object.create, constructor functions, and ES6 classes.</p>" },
          { title: "Arrays & Iteration Methods", duration: 25, videoUrl: "https://www.youtube.com/watch?v=W6NZfCO5SIk", content: "<p>Arrays are ordered collections. Learn array creation, indexing, length property, and mutating vs non-mutating methods like push, pop, shift, unshift, splice, and slice.</p><p>Master iteration methods: forEach, map, filter, reduce, find, some, every, and sort. Understand callback functions and chaining methods.</p>" }
        ],
        quiz: {
          title: "Core JavaScript Quiz",
          passingScore: 70,
          questions: [
            { text: "What is the difference between 'let' and 'const'?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "const cannot be reassigned after declaration", isCorrect: true }, { text: "let cannot be reassigned after declaration", isCorrect: false }, { text: "const is block-scoped and let is function-scoped", isCorrect: false }, { text: "There is no difference", isCorrect: false }] },
            { text: "What does the 'map' method return?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "A new array with transformed elements", isCorrect: true }, { text: "The original array modified in place", isCorrect: false }, { text: "A boolean indicating success", isCorrect: false }, { text: "The first matching element", isCorrect: false }] },
            { text: "What is a closure in JavaScript?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "A function that retains access to its outer scope", isCorrect: true }, { text: "A function that runs immediately after definition", isCorrect: false }, { text: "A way to close a browser window", isCorrect: false }, { text: "A method to terminate a loop", isCorrect: false }] },
            { text: "Which operator checks both value and type?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "===", isCorrect: true }, { text: "==", isCorrect: false }, { text: "=", isCorrect: false }, { text: "!=", isCorrect: false }] }
          ]
        }
      },
      {
        title: "Asynchronous JavaScript",
        lessons: [
          { title: "Callbacks & Higher-Order Functions", duration: 25, videoUrl: "https://www.youtube.com/watch?v=PoRJizF8Mnc", content: "<p>Callbacks are functions passed as arguments to other functions. They are fundamental to asynchronous programming in JavaScript. Learn patterns like event handlers, setTimeout, and fs.readFile.</p><p>Higher-order functions take functions as arguments or return them. Understand callback hell and why it became a problem in complex applications.</p>" },
          { title: "Promises & Promise Chaining", duration: 30, videoUrl: "https://www.youtube.com/watch?v=DHvZLI7Db8E", content: "<p>Promises represent eventual completion or failure of an asynchronous operation. Learn the three states: pending, fulfilled, and rejected. Understand how to create and consume promises.</p><p>Chain promises with .then() and .catch(). Learn Promise.all, Promise.race, Promise.allSettled, and Promise.any for concurrent operations.</p>" },
          { title: "Async/Await & Error Handling", duration: 30, videoUrl: "https://www.youtube.com/watch?v=V_Kr9OSfW9U", content: "<p>Async/await is syntactic sugar over promises. Mark functions with async and use await to pause execution until a promise settles. This makes asynchronous code read like synchronous code.</p><p>Handle errors with try/catch blocks around await expressions. Learn best practices for error handling and how to debug async code.</p>" },
          { title: "The Event Loop & Microtasks", duration: 35, videoUrl: "https://www.youtube.com/watch?v=8aGhZQNJFJQ", content: "<p>The event loop is what makes JavaScript non-blocking despite being single-threaded. Understand the call stack, task queue, and microtask queue.</p><p>Learn how setTimeout, Promises, and async/await interact with the event loop. Understand microtasks vs macrotasks and how they affect execution order.</p>" }
        ],
        quiz: {
          title: "Async JavaScript Quiz",
          passingScore: 70,
          questions: [
            { text: "What is the primary purpose of async/await?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "To make asynchronous code read like synchronous code", isCorrect: true }, { text: "To make code run faster", isCorrect: false }, { text: "To replace all callback functions", isCorrect: false }, { text: "To create new threads", isCorrect: false }] },
            { text: "What does Promise.all do?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Resolves when all promises in the iterable resolve", isCorrect: true }, { text: "Resolves when the first promise settles", isCorrect: false }, { text: "Rejects if any promise rejects", isCorrect: false }, { text: "Runs promises sequentially", isCorrect: false }] },
            { text: "Which queue does the event loop process first?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Microtask queue", isCorrect: true }, { text: "Macrotask queue", isCorrect: false }, { text: "Callback queue", isCorrect: false }, { text: "Render queue", isCorrect: false }] }
          ]
        }
      }
    ]
  },
  {
    title: "React & Next.js",
    description: "Build modern full-stack web apps with React 18 and Next.js 14. Learn components, hooks, server-side rendering, API routes, and App Router patterns used by top production applications.",
    category: "Web Development",
    isFree: true,
    modules: [
      {
        title: "React Foundations",
        lessons: [
          { title: "JSX & Component Architecture", duration: 30, videoUrl: "https://www.youtube.com/watch?v=Ke90Tje7VS0", content: "<p>JSX is a syntax extension for JavaScript that looks like HTML. It compiles to React.createElement calls. Learn JSX rules: single root element, closing tags, camelCase properties, and embedding expressions with curly braces.</p><p>Components are the building blocks of React. Learn functional components, props, children, and the mental model of thinking in components.</p>" },
          { title: "State Management with Hooks", duration: 35, videoUrl: "https://www.youtube.com/watch?v=O6P86uwfdR0", content: "<p>State is data that changes over time. Learn useState hook for local state management. Understand the rules of hooks: only call hooks at the top level and only from React functions.</p><p>Use useEffect for side effects like data fetching, subscriptions, and DOM manipulation. Learn dependency arrays, cleanup functions, and common patterns.</p>" },
          { title: "Props, Events & Conditional Rendering", duration: 25, videoUrl: "https://www.youtube.com/watch?v=Ke90Tje7VS0", content: "<p>Props are read-only data passed from parent to child components. Learn prop drilling, default props, prop types, and the children pattern.</p><p>Handle events with synthetic events. Conditionally render elements with ternary operators, logical AND, switch statements, and early returns.</p>" },
          { title: "Lists & Keys", duration: 20, videoUrl: "https://www.youtube.com/watch?v=Ke90Tje7VS0", content: "<p>Render lists using the map method with unique key props. Keys help React identify which items changed, added, or removed. Learn why using index as key is problematic and when it is acceptable.</p><p>Build a todo list application combining state, events, and list rendering. Understand controlled vs uncontrolled components with forms.</p>" }
        ],
        quiz: {
          title: "React Foundations Quiz",
          passingScore: 70,
          questions: [
            { text: "What is JSX?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "A syntax extension that compiles to React.createElement calls", isCorrect: true }, { text: "A templating engine for HTML", isCorrect: false }, { text: "A CSS preprocessor for React", isCorrect: false }, { text: "A new programming language", isCorrect: false }] },
            { text: "What is the purpose of the useEffect hook?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "To perform side effects in function components", isCorrect: true }, { text: "To manage component state", isCorrect: false }, { text: "To create context", isCorrect: false }, { text: "To optimize re-renders", isCorrect: false }] },
            { text: "Why should you avoid using array index as a key?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "It can cause incorrect behavior when items are reordered", isCorrect: true }, { text: "It causes syntax errors", isCorrect: false }, { text: "It makes the app slower", isCorrect: false }, { text: "It is not valid React syntax", isCorrect: false }] },
            { text: "What are props in React?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Read-only data passed from parent to child components", isCorrect: true }, { text: "Mutable local state in a component", isCorrect: false }, { text: "Global state accessible to all components", isCorrect: false }, { text: "Methods to modify the DOM directly", isCorrect: false }] }
          ]
        }
      },
      {
        title: "Next.js App Router",
        lessons: [
          { title: "File-Based Routing & Layouts", duration: 30, videoUrl: "https://www.youtube.com/watch?v=NgayZAuTgwM", content: "<p>Next.js App Router uses a file-system based routing paradigm. Pages are created by exporting default components from page.tsx files. Nested routes map to nested folders.</p><p>Layouts persist across navigations and do not re-render. Learn root layout, nested layouts, templates, and loading states with loading.tsx.</p>" },
          { title: "Server vs Client Components", duration: 35, videoUrl: "https://www.youtube.com/watch?v=NgayZAuTgwM", content: "<p>React Server Components run on the server and send only the result to the client. They reduce JavaScript bundle size and can access databases directly.</p><p>Client Components are marked with 'use client' and have access to hooks, event handlers, and browser APIs. Learn when to use each and how to compose them.</p>" },
          { title: "Data Fetching & Caching", duration: 30, videoUrl: "https://www.youtube.com/watch?v=NgayZAuTgwM", content: "<p>Next.js extends the native fetch API with caching and revalidation options. Learn static data fetching, dynamic fetching, and incremental static regeneration.</p><p>Use cache option for time-based revalidation, next tags for on-demand revalidation, and no-store for always-fresh data. Understand caching layers.</p>" },
          { title: "API Routes & Server Actions", duration: 25, videoUrl: "https://www.youtube.com/watch?v=NgayZAuTgwM", content: "<p>API routes in the App Router are defined as route handlers in route.ts files. They export functions for HTTP methods: GET, POST, PUT, PATCH, DELETE.</p><p>Server Actions are async functions that run on the server. They can be called from client components or forms. Learn form validation, revalidation, and redirect patterns.</p>" }
        ],
        quiz: {
          title: "Next.js App Router Quiz",
          passingScore: 70,
          questions: [
            { text: "What is the main benefit of React Server Components?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "They reduce client-side JavaScript bundle size", isCorrect: true }, { text: "They run faster on the client", isCorrect: false }, { text: "They replace all client components", isCorrect: false }, { text: "They eliminate the need for CSS", isCorrect: false }] },
            { text: "How do you mark a component as a Client Component?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Add 'use client' directive at the top of the file", isCorrect: true }, { text: "Export it as default", isCorrect: false }, { text: "Add a .client.ts extension", isCorrect: false }, { text: "Import it from 'react/client'", isCorrect: false }] },
            { text: "Which file is used to persist layout across pages in the App Router?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "layout.tsx", isCorrect: true }, { text: "page.tsx", isCorrect: false }, { text: "template.tsx", isCorrect: false }, { text: "app.tsx", isCorrect: false }] }
          ]
        }
      }
    ]
  },
  {
    title: "Python for Beginners",
    description: "Start your programming journey with Python. Learn syntax, data structures, file I/O, error handling, and build real-world scripts. Python is the #1 language for beginners and professionals alike.",
    category: "Programming",
    isFree: true,
    modules: [
      {
        title: "Python Basics",
        lessons: [
          { title: "Getting Started with Python", duration: 25, videoUrl: "https://www.youtube.com/watch?v=kqtD5dpn9C8", content: "<p>Python is a high-level, interpreted programming language known for its readability and simplicity. Install Python, set up a virtual environment, and write your first script.</p><p>Learn the Python interactive shell, basic arithmetic operations, comments, and the print function. Understand Python's philosophy of explicit over implicit.</p>" },
          { title: "Variables & Data Types", duration: 30, videoUrl: "https://www.youtube.com/watch?v=kqtD5dpn9C8", content: "<p>Python is dynamically typed. Learn about integers, floats, strings, booleans, and None. Type conversion functions like int(), float(), str(), and bool().</p><p>String operations include concatenation, slicing, formatting with f-strings, and common methods like split, join, replace, and find.</p>" },
          { title: "Control Flow & Loops", duration: 30, videoUrl: "https://www.youtube.com/watch?v=kqtD5dpn9C8", content: "<p>Control the flow of your programs with if, elif, else statements. Learn comparison operators, logical operators, and truthiness in Python.</p><p>Loops: for loops iterate over sequences, while loops run until a condition is false. Learn break, continue, else clauses on loops, and the range function.</p>" },
          { title: "Functions & Modules", duration: 25, videoUrl: "https://www.youtube.com/watch?v=kqtD5dpn9C8", content: "<p>Functions are defined with def. Learn parameters, return values, default arguments, keyword arguments, variable-length arguments with *args and **kwargs.</p><p>Modules are Python files with .py extension. Import modules with import, from...import, and as aliases. Learn about the __name__ == '__main__' pattern.</p>" }
        ],
        quiz: {
          title: "Python Basics Quiz",
          passingScore: 70,
          questions: [
            { text: "What is the correct way to create a list in Python?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "my_list = [1, 2, 3]", isCorrect: true }, { text: "my_list = (1, 2, 3)", isCorrect: false }, { text: "my_list = {1, 2, 3}", isCorrect: false }, { text: "my_list = <1, 2, 3>", isCorrect: false }] },
            { text: "What does the len() function do?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Returns the number of items in a container", isCorrect: true }, { text: "Converts a value to a string", isCorrect: false }, { text: "Checks if a variable exists", isCorrect: false }, { text: "Returns the largest item", isCorrect: false }] },
            { text: "How do you define a function in Python?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "def my_function():", isCorrect: true }, { text: "function my_function():", isCorrect: false }, { text: "func my_function():", isCorrect: false }, { text: "define my_function():", isCorrect: false }] },
            { text: "What is a module in Python?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "A file containing Python definitions and statements", isCorrect: true }, { text: "A built-in function", isCorrect: false }, { text: "A type of loop", isCorrect: false }, { text: "A data structure", isCorrect: false }] }
          ]
        }
      },
      {
        title: "Data Structures & File I/O",
        lessons: [
          { title: "Lists & Tuples", duration: 30, videoUrl: "https://www.youtube.com/watch?v=W8KRzm-HUcc", content: "<p>Lists are mutable ordered sequences. Learn list methods: append, extend, insert, remove, pop, clear, index, count, sort, reverse, and copy.</p><p>Tuples are immutable ordered sequences. They are faster than lists and can be used as dictionary keys. Learn tuple packing and unpacking.</p>" },
          { title: "Dictionaries & Sets", duration: 30, videoUrl: "https://www.youtube.com/watch?v=W8KRzm-HUcc", content: "<p>Dictionaries are unordered collections of key-value pairs. Learn dictionary methods: keys, values, items, get, setdefault, update, pop, and popitem.</p><p>Sets are unordered collections of unique elements. Learn set operations: union, intersection, difference, symmetric difference, and subset/superset checks.</p>" },
          { title: "File Handling & Exceptions", duration: 25, videoUrl: "https://www.youtube.com/watch?v=W8KRzm-HUcc", content: "<p>Read and write files using the open function and context managers (with statement). Learn file modes: r, w, a, rb, wb. Read entire files, line by line, or in chunks.</p><p>Handle errors with try, except, else, and finally blocks. Learn common exception types and custom exceptions. Use logging for debugging.</p>" },
          { title: "List Comprehensions & Generators", duration: 20, videoUrl: "https://www.youtube.com/watch?v=W8KRzm-HUcc", content: "<p>List comprehensions provide concise syntax for creating lists. Syntax: [expression for item in iterable if condition]. They are faster than traditional loops.</p><p>Generator expressions use parentheses and yield values lazily. Generator functions use the yield keyword. They are memory-efficient for large datasets.</p>" }
        ],
        quiz: {
          title: "Data Structures Quiz",
          passingScore: 70,
          questions: [
            { text: "What is the difference between a list and a tuple?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Lists are mutable, tuples are immutable", isCorrect: true }, { text: "Lists are faster than tuples", isCorrect: false }, { text: "Tuples can only contain numbers", isCorrect: false }, { text: "There is no difference", isCorrect: false }] },
            { text: "How do you open a file for reading in Python?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "open('file.txt', 'r')", isCorrect: true }, { text: "open('file.txt', 'w')", isCorrect: false }, { text: "open('file.txt', 'a')", isCorrect: false }, { text: "read('file.txt')", isCorrect: false }] },
            { text: "What does a list comprehension do?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Creates a new list by applying an expression to each item", isCorrect: true }, { text: "Sorts the list in place", isCorrect: false }, { text: "Removes duplicates from the list", isCorrect: false }, { text: "Converts a list to a dictionary", isCorrect: false }] }
          ]
        }
      }
    ]
  },
  {
    title: "Java Programming",
    description: "Master Java from basics to advanced. Learn OOP, collections, streams, multithreading, and build robust enterprise applications. One of the most in-demand languages for enterprise development.",
    category: "Programming",
    isFree: true,
    modules: [
      {
        title: "Java Fundamentals",
        lessons: [
          { title: "Java Basics & Syntax", duration: 25, videoUrl: "https://www.youtube.com/watch?v=eIrMbAQSU34", content: "<p>Java is a statically-typed, object-oriented programming language known for its 'write once, run anywhere' philosophy. Set up JDK, understand JVM vs JRE vs JDK.</p><p>Learn basic syntax: classes, main method, variables, primitive types (int, double, boolean, char), and operators. Write and compile your first Java program.</p>" },
          { title: "Object-Oriented Programming", duration: 35, videoUrl: "https://www.youtube.com/watch?v=eIrMbAQSU34", content: "<p>OOP is the foundation of Java. Learn classes, objects, constructors, instance variables, methods, and the this keyword. Understand encapsulation with access modifiers: private, default, protected, public.</p><p>Learn inheritance with extends, polymorphism with method overriding, and abstraction with abstract classes and interfaces.</p>" },
          { title: "Exception Handling", duration: 25, videoUrl: "https://www.youtube.com/watch?v=eIrMbAQSU34", content: "<p>Exceptions are events that disrupt normal program flow. Learn try, catch, finally, and throw. Understand checked vs unchecked exceptions.</p><p>Create custom exceptions by extending Exception or RuntimeException. Learn try-with-resources for automatic resource management.</p>" },
          { title: "Generics & Collections", duration: 30, videoUrl: "https://www.youtube.com/watch?v=eIrMbAQSU34", content: "<p>Generics provide type safety and eliminate casting. Learn generic classes, methods, bounded type parameters, and wildcards.</p><p>Collections framework: List (ArrayList, LinkedList), Set (HashSet, TreeSet), Map (HashMap, TreeMap). Understand equals and hashCode contract.</p>" }
        ],
        quiz: {
          title: "Java Fundamentals Quiz",
          passingScore: 70,
          questions: [
            { text: "What is the JVM?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Java Virtual Machine that runs Java bytecode", isCorrect: true }, { text: "Java Version Manager", isCorrect: false }, { text: "Java Visual Monitor", isCorrect: false }, { text: "A Java library for machine learning", isCorrect: false }] },
            { text: "Which keyword is used to inherit a class in Java?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "extends", isCorrect: true }, { text: "implements", isCorrect: false }, { text: "inherits", isCorrect: false }, { text: "super", isCorrect: false }] },
            { text: "What is the difference between checked and unchecked exceptions?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Checked exceptions must be handled at compile time, unchecked at runtime", isCorrect: true }, { text: "Checked exceptions are more severe than unchecked", isCorrect: false }, { text: "Unchecked exceptions must be declared in throws clause", isCorrect: false }, { text: "There is no difference", isCorrect: false }] },
            { text: "What does the 'final' keyword mean for a variable?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "The variable cannot be reassigned", isCorrect: true }, { text: "The variable is accessible from any class", isCorrect: false }, { text: "The variable is stored in a file", isCorrect: false }, { text: "The variable is automatically deleted", isCorrect: false }] }
          ]
        }
      },
      {
        title: "Advanced Java",
        lessons: [
          { title: "Streams & Lambda Expressions", duration: 35, videoUrl: "https://www.youtube.com/watch?v=t1-YZ6bF-g0", content: "<p>Lambda expressions provide concise syntax for implementing functional interfaces. Syntax: (parameters) -> expression or (parameters) -> { statements }.</p><p>Stream API processes sequences of elements. Learn intermediate operations: filter, map, flatMap, distinct, sorted, peek. Terminal operations: forEach, collect, reduce, count, anyMatch, allMatch, noneMatch.</p>" },
          { title: "Multithreading & Concurrency", duration: 35, videoUrl: "https://www.youtube.com/watch?v=t1-YZ6bF-g0", content: "<p>Multithreading enables concurrent execution. Extend Thread class or implement Runnable. Understand thread lifecycle: new, runnable, running, blocked, waiting, terminated.</p><p>Learn synchronization with synchronized blocks, volatile keyword, and locks. Use ExecutorService for thread pool management. Understand deadlocks and how to avoid them.</p>" },
          { title: "File I/O & Serialization", duration: 25, videoUrl: "https://www.youtube.com/watch?v=t1-YZ6bF-g0", content: "<p>Java I/O uses streams: InputStream, OutputStream, Reader, Writer. Learn FileInputStream, FileOutputStream, BufferedReader, BufferedWriter, and PrintWriter.</p><p>Serialization converts objects to byte streams using ObjectOutputStream and deserializes with ObjectInputStream. Learn the Serializable interface and transient keyword.</p>" }
        ],
        quiz: {
          title: "Advanced Java Quiz",
          passingScore: 70,
          questions: [
            { text: "What is a lambda expression?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "A concise way to implement a functional interface", isCorrect: true }, { text: "A way to create anonymous classes", isCorrect: false }, { text: "A method that returns a lambda value", isCorrect: false }, { text: "A new data type in Java", isCorrect: false }] },
            { text: "Which interface should a class implement to be serializable?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Serializable", isCorrect: true }, { text: "Cloneable", isCorrect: false }, { text: "Comparable", isCorrect: false }, { text: "Runnable", isCorrect: false }] },
            { text: "What is the purpose of the 'synchronized' keyword?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "To prevent race conditions by allowing only one thread at a time", isCorrect: true }, { text: "To make a method run faster", isCorrect: false }, { text: "To create a new thread", isCorrect: false }, { text: "To stop all threads", isCorrect: false }] }
          ]
        }
      }
    ]
  },
  {
    title: "C++ Essentials",
    description: "Learn C++ programming from the ground up. Master memory management, STL, pointers, templates, and build high-performance applications. Ideal for systems programming and game development.",
    category: "Programming",
    isFree: true,
    modules: [
      {
        title: "C++ Core Language",
        lessons: [
          { title: "Variables, Types & Functions", duration: 30, videoUrl: "https://www.youtube.com/watch?v=vLnPwxZdW4Y", content: "<p>C++ is a statically-typed compiled language offering both high-level and low-level features. Set up a compiler, understand the compilation process, and write your first program.</p><p>Learn fundamental types: int, float, double, char, bool, and auto keyword. Understand const, constexpr, references, and function overloading.</p>" },
          { title: "Object-Oriented C++", duration: 35, videoUrl: "https://www.youtube.com/watch?v=vLnPwxZdW4Y", content: "<p>C++ supports object-oriented programming with classes. Learn constructors, destructors, copy constructors, move constructors, and the rule of three/five.</p><p>Understand inheritance, virtual functions, pure virtual functions, abstract base classes, and polymorphism. Learn the virtual table and dynamic dispatch.</p>" },
          { title: "Memory Management & Pointers", duration: 35, videoUrl: "https://www.youtube.com/watch?v=vLnPwxZdW4Y", content: "<p>C++ gives you direct control over memory. Learn stack vs heap allocation, new and delete operators, raw pointers, pointer arithmetic, and dynamic arrays.</p><p>Smart pointers (unique_ptr, shared_ptr, weak_ptr) automate memory management. Understand ownership semantics, reference counting, and circular references.</p>" },
          { title: "Templates & Generic Programming", duration: 25, videoUrl: "https://www.youtube.com/watch?v=vLnPwxZdW4Y", content: "<p>Templates enable generic programming. Learn function templates, class templates, template specialization, and variadic templates.</p><p>Understand template argument deduction, SFINAE, and concepts (C++20). Templates are the foundation of the STL and enable zero-cost abstractions.</p>" }
        ],
        quiz: {
          title: "C++ Core Language Quiz",
          passingScore: 70,
          questions: [
            { text: "What is the difference between new and malloc?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "new calls the constructor, malloc does not", isCorrect: true }, { text: "malloc is safer than new", isCorrect: false }, { text: "new is only for arrays", isCorrect: false }, { text: "There is no difference", isCorrect: false }] },
            { text: "What does the 'virtual' keyword do?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Enables runtime polymorphism through dynamic dispatch", isCorrect: true }, { text: "Makes a function inline", isCorrect: false }, { text: "Creates a pure virtual function", isCorrect: false }, { text: "Hides the function from derived classes", isCorrect: false }] },
            { text: "What is a smart pointer?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "A wrapper around a raw pointer that automatically manages memory", isCorrect: true }, { text: "A pointer that can point to multiple types", isCorrect: false }, { text: "A pointer optimized for smart devices", isCorrect: false }, { text: "A pointer with built-in bounds checking", isCorrect: false }] },
            { text: "What is the STL?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Standard Template Library with containers, algorithms, and iterators", isCorrect: true }, { text: "Simple Type Library", isCorrect: false }, { text: "Structured Testing Language", isCorrect: false }, { text: "Static Type Loader", isCorrect: false }] }
          ]
        }
      },
      {
        title: "STL & Modern C++",
        lessons: [
          { title: "STL Containers", duration: 30, videoUrl: "https://www.youtube.com/watch?v=6OoSgY6NVVk", content: "<p>The STL provides generic containers: vector, deque, list, forward_list, set, multiset, map, multimap, unordered_set, unordered_map.</p><p>Choose the right container based on performance characteristics. Understand iterator invalidation rules and when each container is appropriate.</p>" },
          { title: "STL Algorithms", duration: 30, videoUrl: "https://www.youtube.com/watch?v=6OoSgY6NVVk", content: "<p>STL algorithms operate on ranges defined by iterators. Learn sorting (sort, stable_sort, partial_sort), searching (find, binary_search, lower_bound, upper_bound), and modifying (copy, transform, replace, remove, unique).</p><p>Numeric algorithms: accumulate, inner_product, adjacent_difference, partial_sum. Learn algorithm complexity and when to use each.</p>" },
          { title: "Move Semantics & Rvalue References", duration: 35, videoUrl: "https://www.youtube.com/watch?v=6OoSgY6NVVk", content: "<p>Move semantics eliminate unnecessary copying. Learn lvalues, rvalues, lvalue references, rvalue references (&&), and std::move.</p><p>Move constructors and move assignment operators transfer resources. Understand noexcept specifier, copy-elision, and return value optimization.</p>" },
          { title: "C++20 Features", duration: 25, videoUrl: "https://www.youtube.com/watch?v=6OoSgY6NVVk", content: "<p>C++20 is the latest major standard. Learn concepts for constraining templates, ranges library for composing algorithms, coroutines for asynchronous programming.</p><p>Other features: three-way comparison (spaceship operator), constexpr improvements, std::span, std::format, calendar and time zone library.</p>" }
        ],
        quiz: {
          title: "STL & Modern C++ Quiz",
          passingScore: 70,
          questions: [
            { text: "What is std::move used for?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "To cast an lvalue to an rvalue reference for move semantics", isCorrect: true }, { text: "To physically move data in memory", isCorrect: false }, { text: "To copy a container", isCorrect: false }, { text: "To sort elements", isCorrect: false }] },
            { text: "Which container provides O(1) amortized push_back?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "std::vector", isCorrect: true }, { text: "std::list", isCorrect: false }, { text: "std::set", isCorrect: false }, { text: "std::map", isCorrect: false }] },
            { text: "What are C++20 concepts?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Constraints on template parameters for compile-time validation", isCorrect: true }, { text: "Visual diagrams for OOP design", isCorrect: false }, { text: "Ideas for new C++ features", isCorrect: false }, { text: "Memory management techniques", isCorrect: false }] }
          ]
        }
      }
    ]
  },

  {
    title: "Data Science with Python",
    description: "Learn data science using Python's powerful ecosystem. Master NumPy, Pandas, Matplotlib, and Seaborn for data analysis, visualization, and insights extraction from real-world datasets.",
    category: "Data Science",
    isFree: true,
    modules: [
      {
        title: "NumPy & Pandas Fundamentals",
        lessons: [
          { title: "Introduction to NumPy Arrays", duration: 30, videoUrl: "https://www.youtube.com/watch?v=QUT1VHiLmmI", content: "<p>NumPy is the fundamental package for scientific computing in Python. Learn about n-dimensional arrays, array creation routines, indexing, slicing, and broadcasting.</p><p>Understand vectorization and how NumPy operations are faster than Python loops. Perform element-wise operations, matrix multiplication, and linear algebra operations.</p>" },
          { title: "Pandas Series & DataFrames", duration: 35, videoUrl: "https://www.youtube.com/watch?v=vmEHCJof9g", content: "<p>Pandas provides high-performance data structures: Series (1D labeled array) and DataFrame (2D labeled table). Learn creation, indexing with loc and iloc, handling missing data, and data alignment.</p><p>Import data from CSV, Excel, JSON, and SQL. Export to various formats. Understand the copy vs view semantics.</p>" },
          { title: "Data Cleaning & Transformation", duration: 30, videoUrl: "https://www.youtube.com/watch?v=vmEHCJof9g", content: "<p>Real-world data is messy. Learn to handle missing values with dropna, fillna, and interpolation. Detect and remove duplicates with drop_duplicates.</p><p>Transform data with apply, map, and applymap. Rename columns, change dtypes, and handle categorical data. String operations with str accessor.</p>" },
          { title: "Grouping & Aggregation", duration: 25, videoUrl: "https://www.youtube.com/watch?v=vmEHCJof9g", content: "<p>Split-apply-combine operations with groupby. Learn aggregation functions like sum, mean, count, min, max, std, and custom aggregations.</p><p>Pivot tables and cross-tabulations. Multi-level indexing for hierarchical data. Time series resampling with different frequencies.</p>" }
        ],
        quiz: {
          title: "NumPy & Pandas Quiz",
          passingScore: 70,
          questions: [
            { text: "What is the main data structure in Pandas for tabular data?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "DataFrame", isCorrect: true }, { text: "Series", isCorrect: false }, { text: "Array", isCorrect: false }, { text: "Matrix", isCorrect: false }] },
            { text: "Which method is used to handle missing values in Pandas?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "dropna", isCorrect: true }, { text: "cleanna", isCorrect: false }, { text: "removena", isCorrect: false }, { text: "skipna", isCorrect: false }] },
            { text: "What does broadcasting mean in NumPy?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Performing operations between arrays of different shapes", isCorrect: true }, { text: "Printing array values to console", isCorrect: false }, { text: "Distributing array elements across CPU cores", isCorrect: false }, { text: "Converting a list to an array", isCorrect: false }] },
            { text: "Which method creates a pivot table in Pandas?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "pivot_table", isCorrect: true }, { text: "pivot", isCorrect: false }, { text: "groupby", isCorrect: false }, { text: "cross_tab", isCorrect: false }] }
          ]
        }
      },
      {
        title: "Data Visualization",
        lessons: [
          { title: "Matplotlib Fundamentals", duration: 30, videoUrl: "https://www.youtube.com/watch?v=3Xc3CA6ijzU", content: "<p>Matplotlib is the foundational plotting library in Python. Learn the figure and axes API, creating line plots, scatter plots, bar charts, histograms, and pie charts.</p><p>Customize plots with titles, labels, legends, grid lines, and annotations. Save figures to various formats with dpi control.</p>" },
          { title: "Seaborn Statistical Plots", duration: 25, videoUrl: "https://www.youtube.com/watch?v=6T0ypb9n6Vc", content: "<p>Seaborn provides high-level interfaces for statistical graphics. Learn distribution plots (histplot, kdeplot, jointplot), categorical plots (boxplot, violinplot, stripplot), and regression plots.</p><p>Understand how to visualize relationships between multiple variables with hue, style, size, and col parameters. Create heatmaps for correlation matrices.</p>" },
          { title: "Interactive Visualizations with Plotly", duration: 30, videoUrl: "https://www.youtube.com/watch?v=GGL6U0kPHW", content: "<p>Plotly creates interactive web-based visualizations. Learn to create line charts, scatter plots, bar charts, histograms, and 3D plots with hover tooltips and zoom capabilities.</p><p>Combine multiple traces in a single figure. Create subplots with shared axes. Export interactive plots as HTML files.</p>" },
          { title: "Storytelling with Data", duration: 20, videoUrl: "https://www.youtube.com/watch?v=A-rFbpdxN1A", content: "<p>Data visualization is about communication. Learn principles of effective visual design: choosing the right chart type, color theory, avoiding misleading visuals, and highlighting key insights.</p><p>Create a complete data story from raw data to polished dashboard. Use dashboards to present multiple views of the same dataset.</p>" }
        ],
        quiz: {
          title: "Data Visualization Quiz",
          passingScore: 70,
          questions: [
            { text: "Which library is built on top of Matplotlib for statistical graphics?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Seaborn", isCorrect: true }, { text: "Plotly", isCorrect: false }, { text: "Bokeh", isCorrect: false }, { text: "ggplot", isCorrect: false }] },
            { text: "What is a heatmap best used for?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Visualizing correlation matrices or 2D data intensity", isCorrect: true }, { text: "Showing geographic data on a map", isCorrect: false }, { text: "Plotting time series data", isCorrect: false }, { text: "Displaying pie charts", isCorrect: false }] },
            { text: "What is the main advantage of Plotly over Matplotlib?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Interactive web-based visualizations", isCorrect: true }, { text: "Faster rendering of static images", isCorrect: false }, { text: "Lower memory usage", isCorrect: false }, { text: "Better default color schemes", isCorrect: false }] }
          ]
        }
      }
    ]
  },
  {
    title: "Machine Learning Basics",
    description: "Understand the fundamentals of machine learning: supervised and unsupervised learning, regression, classification, clustering, model evaluation, and deployment pipelines.",
    category: "Machine Learning",
    isFree: true,
    modules: [
      {
        title: "Supervised Learning",
        lessons: [
          { title: "Linear Regression", duration: 30, videoUrl: "https://www.youtube.com/watch?v=4qVRmAD4Kes", content: "<p>Linear regression models the relationship between features and a continuous target. Learn the mathematical formulation, ordinary least squares, gradient descent optimization, and closed-form solution.</p><p>Evaluate models with R-squared, Mean Squared Error, and Mean Absolute Error. Understand assumptions: linearity, independence, homoscedasticity, and normality of residuals.</p>" },
          { title: "Logistic Regression & Classification", duration: 30, videoUrl: "https://www.youtube.com/watch?v=yIYKR4sgzI8", content: "<p>Logistic regression predicts binary outcomes using the sigmoid function. Learn odds ratio, log-odds, decision boundary, and maximum likelihood estimation.</p><p>Evaluate classification with confusion matrix, precision, recall, F1-score, ROC curve, and AUC. Handle imbalanced datasets with class weights and resampling.</p>" },
          { title: "Decision Trees & Random Forests", duration: 35, videoUrl: "https://www.youtube.com/watch?v=7VeUPuFGJHk", content: "<p>Decision trees split data based on feature values. Learn impurity measures: Gini impurity, entropy, and variance reduction. Understand tree depth, pruning, and feature importance.</p><p>Random forests combine multiple trees through bagging to reduce overfitting. Learn ensemble methods, out-of-bag error, and hyperparameter tuning.</p>" },
          { title: "Support Vector Machines", duration: 25, videoUrl: "https://www.youtube.com/watch?v=efR1C6CvhmE", content: "<p>SVMs find the optimal hyperplane that maximizes the margin between classes. Learn hard margin vs soft margin, kernel trick (linear, polynomial, RBF), and support vectors.</p><p>Understand C parameter for regularization and gamma for RBF kernel. SVMs are effective in high-dimensional spaces and with clear margin of separation.</p>" }
        ],
        quiz: {
          title: "Supervised Learning Quiz",
          passingScore: 70,
          questions: [
            { text: "What is the difference between regression and classification?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Regression predicts continuous values, classification predicts discrete labels", isCorrect: true }, { text: "Regression is supervised, classification is unsupervised", isCorrect: false }, { text: "Regression uses neural networks, classification uses decision trees", isCorrect: false }, { text: "There is no difference", isCorrect: false }] },
            { text: "What does the ROC curve represent?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "True Positive Rate vs False Positive Rate at various thresholds", isCorrect: true }, { text: "Precision vs Recall at various thresholds", isCorrect: false }, { text: "Accuracy vs Model Complexity", isCorrect: false }, { text: "Training time vs Dataset size", isCorrect: false }] },
            { text: "What is the purpose of the kernel trick in SVMs?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "To map data to higher dimensions without computing the transformation", isCorrect: true }, { text: "To reduce the number of support vectors", isCorrect: false }, { text: "To make the model train faster", isCorrect: false }, { text: "To visualize decision boundaries", isCorrect: false }] },
            { text: "Which ensemble method uses bootstrapped samples and random feature subsets?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Random Forest", isCorrect: true }, { text: "AdaBoost", isCorrect: false }, { text: "Gradient Boosting", isCorrect: false }, { text: "XGBoost", isCorrect: false }] }
          ]
        }
      },
      {
        title: "Unsupervised Learning & Model Evaluation",
        lessons: [
          { title: "K-Means Clustering", duration: 30, videoUrl: "https://www.youtube.com/watch?v=4b5d3muPQmA", content: "<p>K-means partitions data into K clusters by minimizing within-cluster variance. Learn the algorithm steps: initialization, assignment, update, and convergence.</p><p>Choose K with the elbow method, silhouette score, and gap statistic. Understand limitations: sensitivity to initialization, assumption of spherical clusters, and scaling issues.</p>" },
          { title: "Hierarchical & DBSCAN Clustering", duration: 25, videoUrl: "https://www.youtube.com/watch?v=4b5d3muPQmA", content: "<p>Hierarchical clustering builds a tree of clusters. Learn agglomerative (bottom-up) and divisive (top-down) approaches. Understand linkage criteria: single, complete, average, and Ward's method.</p><p>DBSCAN finds clusters of arbitrary shape based on density. Learn eps and minPts parameters. DBSCAN handles noise well and does not require specifying the number of clusters.</p>" },
          { title: "Dimensionality Reduction with PCA", duration: 30, videoUrl: "https://www.youtube.com/watch?v=FD4DeN81E4E", content: "<p>Principal Component Analysis reduces dimensionality while preserving variance. Learn eigenvalues, eigenvectors, explained variance ratio, and projection to lower dimensions.</p><p>Use PCA for visualization, noise filtering, and as a preprocessing step. Understand the trade-off between dimensionality reduction and information loss.</p>" },
          { title: "Model Validation & Hyperparameter Tuning", duration: 30, videoUrl: "https://www.youtube.com/watch?v=FD4DeN81E4E", content: "<p>Proper validation prevents overfitting. Learn train-test split, cross-validation (K-fold, stratified, leave-one-out), and the bias-variance tradeoff.</p><p>Hyperparameter tuning with GridSearchCV and RandomizedSearchCV. Understand learning curves and validation curves to diagnose model performance.</p>" }
        ],
        quiz: {
          title: "Unsupervised Learning Quiz",
          passingScore: 70,
          questions: [
            { text: "What is the elbow method used for?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Finding the optimal number of clusters in K-means", isCorrect: true }, { text: "Determining learning rate for gradient descent", isCorrect: false }, { text: "Selecting features for a model", isCorrect: false }, { text: "Evaluating classification accuracy", isCorrect: false }] },
            { text: "What is the main advantage of DBSCAN over K-means?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "It can find arbitrarily shaped clusters and handle noise", isCorrect: true }, { text: "It is always faster than K-means", isCorrect: false }, { text: "It does not require any parameters", isCorrect: false }, { text: "It guarantees global optimum", isCorrect: false }] },
            { text: "What does PCA do?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Reduces dimensionality by finding directions of maximum variance", isCorrect: true }, { text: "Classifies data into predefined categories", isCorrect: false }, { text: "Clusters similar data points together", isCorrect: false }, { text: "Predicts continuous target values", isCorrect: false }] },
            { text: "What is K-fold cross-validation?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Splitting data into K subsets, training on K-1 and testing on 1", isCorrect: true }, { text: "Training K different models independently", isCorrect: false }, { text: "Using K clusters for validation", isCorrect: false }, { text: "K-nearest neighbors for validation", isCorrect: false }] }
          ]
        }
      }
    ]
  },
  {
    title: "Deep Learning",
    description: "Dive into neural networks and deep learning. Learn architectures, backpropagation, CNNs, RNNs, transformers, and frameworks like TensorFlow and PyTorch.",
    category: "Machine Learning",
    isFree: true,
    modules: [
      {
        title: "Neural Network Foundations",
        lessons: [
          { title: "Perceptron & Multi-Layer Networks", duration: 30, videoUrl: "https://www.youtube.com/watch?v=aircAruvnKk", content: "<p>The perceptron is the building block of neural networks. Learn the mathematical model: weighted sum, activation function, and threshold. Understand the XOR problem and why single-layer networks are limited.</p><p>Multi-layer perceptrons (MLPs) add hidden layers with non-linear activations. Learn forward propagation, universal approximation theorem, and network architecture design.</p>" },
          { title: "Backpropagation & Gradient Descent", duration: 35, videoUrl: "https://www.youtube.com/watch?v=IHZwWFHWa-w", content: "<p>Backpropagation computes gradients using the chain rule. Learn the forward pass, loss computation, backward pass, and parameter updates. Understand the vanishing and exploding gradient problems.</p><p>Gradient descent variants: batch, stochastic (SGD), and mini-batch. Optimizers: Momentum, RMSprop, Adam. Learning rate scheduling and warm-up strategies.</p>" },
          { title: "Activation Functions & Regularization", duration: 25, videoUrl: "https://www.youtube.com/watch?v=aircAruvnKk", content: "<p>Activation functions introduce non-linearity. Compare sigmoid, tanh, ReLU, Leaky ReLU, ELU, and Swish. Understand dead neurons and gradient saturation.</p><p>Regularization prevents overfitting. L1 and L2 regularization, dropout, batch normalization, early stopping, and data augmentation. Understand their mechanisms and when to use each.</p>" },
          { title: "Loss Functions & Metrics", duration: 20, videoUrl: "https://www.youtube.com/watch?v=IHZwWFHWa-w", content: "<p>Loss functions measure prediction error. Regression: MSE, MAE, Huber loss. Classification: cross-entropy, binary cross-entropy, hinge loss, focal loss for imbalanced data.</p><p>Choose appropriate metrics: accuracy, precision, recall, F1, IoU for segmentation, BLEU for translation. Understand the relationship between loss functions and evaluation metrics.</p>" }
        ],
        quiz: {
          title: "Neural Network Foundations Quiz",
          passingScore: 70,
          questions: [
            { text: "What problem does the multi-layer perceptron solve that the single perceptron cannot?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "XOR problem (non-linear separability)", isCorrect: true }, { text: "Overfitting", isCorrect: false }, { text: "Memory consumption", isCorrect: false }, { text: "Slow training speed", isCorrect: false }] },
            { text: "What does the chain rule enable in neural networks?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Backpropagation of error gradients through layers", isCorrect: true }, { text: "Forward propagation of inputs", isCorrect: false }, { text: "Initialization of weights", isCorrect: false }, { text: "Data normalization", isCorrect: false }] },
            { text: "Which activation function suffers from the dying ReLU problem?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "ReLU", isCorrect: true }, { text: "Sigmoid", isCorrect: false }, { text: "Tanh", isCorrect: false }, { text: "Swish", isCorrect: false }] },
            { text: "What is the purpose of dropout?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Randomly deactivating neurons during training to prevent co-adaptation", isCorrect: true }, { text: "Removing low-variance features", isCorrect: false }, { text: "Decreasing the learning rate over time", isCorrect: false }, { text: "Skipping training on certain batches", isCorrect: false }] }
          ]
        }
      },
      {
        title: "Advanced Architectures",
        lessons: [
          { title: "Convolutional Neural Networks", duration: 35, videoUrl: "https://www.youtube.com/watch?v=KuXjwB4LzSA", content: "<p>CNNs excel at processing grid-like data such as images. Learn convolution operation, filters, feature maps, stride, padding, and pooling layers.</p><p>Popular architectures: LeNet, AlexNet, VGGNet, ResNet, Inception, and EfficientNet. Understand transfer learning and fine-tuning pre-trained models.</p>" },
          { title: "Recurrent Neural Networks & LSTMs", duration: 30, videoUrl: "https://www.youtube.com/watch?v=WCUNPb-5EYI", content: "<p>RNNs process sequential data by maintaining hidden state. Learn vanilla RNN, backpropagation through time (BPTT), and the vanishing gradient problem.</p><p>LSTM networks introduce gates: forget, input, output gates. GRU simplifies LSTM with update and reset gates. Applications in time series, NLP, and speech processing.</p>" },
          { title: "Transformers & Attention Mechanisms", duration: 35, videoUrl: "https://www.youtube.com/watch?v=wjZofJX0v4M", content: "<p>Transformers revolutionized deep learning with self-attention. Learn attention mechanism: query, key, value, scaled dot-product attention, multi-head attention, and positional encoding.</p><p>Transformer architecture: encoder-decoder structure, feed-forward networks, layer normalization, and residual connections. BERT for understanding, GPT for generation.</p>" },
          { title: "Training & Deployment Best Practices", duration: 25, videoUrl: "https://www.youtube.com/watch?v=wjZofJX0v4M", content: "<p>Train deep networks effectively: gradient clipping, learning rate finder, mixed precision training, distributed training, and experiment tracking with Weights & Biases or MLflow.</p><p>Deploy models: ONNX format, TensorRT optimization, quantization, pruning, and distillation. Serving with TensorFlow Serving, TorchServe, or Triton Inference Server.</p>" }
        ],
        quiz: {
          title: "Advanced Architectures Quiz",
          passingScore: 70,
          questions: [
            { text: "What is the main advantage of using a transformer over an RNN?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Parallel processing of all sequence positions instead of sequential", isCorrect: true }, { text: "Lower memory usage", isCorrect: false }, { text: "Easier to train on CPU", isCorrect: false }, { text: "Works only with text data", isCorrect: false }] },
            { text: "What does a convolutional filter do?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Slides over the input detecting specific patterns like edges or textures", isCorrect: true }, { text: "Reduces the dimensionality of the input", isCorrect: false }, { text: "Normalizes the input values", isCorrect: false }, { text: "Converts color images to grayscale", isCorrect: false }] },
            { text: "What is the purpose of the forget gate in an LSTM?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "To decide which information to discard from the cell state", isCorrect: true }, { text: "To reset the hidden state to zero", isCorrect: false }, { text: "To prevent overfitting", isCorrect: false }, { text: "To accelerate training", isCorrect: false }] }
          ]
        }
      }
    ]
  },
  {
    title: "UI/UX Design Principles",
    description: "Learn the principles of user interface and user experience design. Master wireframing, prototyping, usability testing, design systems, and create delightful digital experiences.",
    category: "UI/UX Design",
    isFree: true,
    modules: [
      {
        title: "UX Research & Strategy",
        lessons: [
          { title: "Design Thinking Process", duration: 30, videoUrl: "https://www.youtube.com/watch?v=_g0jvCYlRfM", content: "<p>Design thinking is a human-centered approach to problem-solving. Learn the five phases: Empathize, Define, Ideate, Prototype, and Test.</p><p>Understand how to conduct user research through interviews, surveys, and observational studies. Synthesize findings into personas, empathy maps, and user journey maps.</p>" },
          { title: "Information Architecture", duration: 25, videoUrl: "https://www.youtube.com/watch?v=_g0jvCYlRfM", content: "<p>Information architecture organizes content so users can navigate intuitively. Learn card sorting, tree testing, sitemaps, and navigation patterns.</p><p>Understand mental models and how users expect content to be structured. Create clear labeling systems and search functionality.</p>" },
          { title: "Wireframing & Prototyping", duration: 35, videoUrl: "https://www.youtube.com/watch?v=_g0jvCYlRfM", content: "<p>Wireframes are low-fidelity layouts that define structure and hierarchy. Learn to sketch, create digital wireframes, and iterate quickly based on feedback.</p><p>Prototypes add interactivity. Learn low-fidelity paper prototypes, mid-fidelity clickable prototypes, and high-fidelity interactive prototypes with tools like Figma and Adobe XD.</p>" },
          { title: "Usability Testing & Analytics", duration: 30, videoUrl: "https://www.youtube.com/watch?v=_g0jvCYlRfM", content: "<p>Test your designs with real users. Learn moderated vs unmoderated testing, remote vs in-person, A/B testing, and guerrilla testing. Define tasks, recruit participants, and analyze results.</p><p>Use analytics tools to track user behavior: heatmaps, click maps, scroll maps, session recordings. Make data-driven design decisions.</p>" }
        ],
        quiz: {
          title: "UX Research Quiz",
          passingScore: 70,
          questions: [
            { text: "What is the first phase of the Design Thinking process?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Empathize", isCorrect: true }, { text: "Ideate", isCorrect: false }, { text: "Prototype", isCorrect: false }, { text: "Test", isCorrect: false }] },
            { text: "What is a persona in UX design?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "A fictional character representing a user type based on research", isCorrect: true }, { text: "The brand personality of the company", isCorrect: false }, { text: "A wireframe template", isCorrect: false }, { text: "A type of user interview", isCorrect: false }] },
            { text: "What is card sorting used for?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "To understand how users categorize information for navigation", isCorrect: true }, { text: "To sort design elements by priority", isCorrect: false }, { text: "To test color combinations", isCorrect: false }, { text: "To organize design files", isCorrect: false }] },
            { text: "What is the difference between a wireframe and a prototype?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Wireframes are static layouts, prototypes are interactive", isCorrect: true }, { text: "Wireframes are in color, prototypes are in grayscale", isCorrect: false }, { text: "Wireframes are digital, prototypes are paper", isCorrect: false }, { text: "There is no difference", isCorrect: false }] }
          ]
        }
      },
      {
        title: "Visual Design & Design Systems",
        lessons: [
          { title: "Color Theory & Typography", duration: 30, videoUrl: "https://www.youtube.com/watch?v=_g0jvCYlRfM", content: "<p>Color theory explains how colors interact. Learn color wheel, color harmony (complementary, analogous, triadic), color psychology, and accessibility contrast ratios.</p><p>Typography choices affect readability and brand perception. Learn type classifications, font pairing, hierarchy, line-height, letter-spacing, and responsive typography.</p>" },
          { title: "Layout & Composition", duration: 25, videoUrl: "https://www.youtube.com/watch?v=_g0jvCYlRfM", content: "<p>Layout principles guide the arrangement of visual elements. Learn the grid system, rule of thirds, visual hierarchy, white space, balance, and alignment.</p><p>Understand F-pattern and Z-pattern reading behaviors. Create consistent spacing with 4px or 8px grid systems.</p>" },
          { title: "Design Systems & Component Libraries", duration: 35, videoUrl: "https://www.youtube.com/watch?v=_g0jvCYlRfM", content: "<p>Design systems provide reusable components and guidelines. Learn about design tokens, component documentation, versioning, and distribution.</p><p>Study popular systems: Material Design, Apple HIG, Atlassian Design System. Build a simple design system with colors, typography, spacing, and basic components.</p>" },
          { title: "Accessibility & Inclusive Design", duration: 25, videoUrl: "https://www.youtube.com/watch?v=_g0jvCYlRfM", content: "<p>Inclusive design ensures products work for everyone. Learn WCAG guidelines, screen reader compatibility, keyboard navigation, color contrast requirements, and focus management.</p><p>Design for cognitive accessibility: clear language, consistent navigation, error prevention, and forgiveness. Understand the business and ethical case for accessibility.</p>" }
        ],
        quiz: {
          title: "Visual Design Quiz",
          passingScore: 70,
          questions: [
            { text: "What is the recommended contrast ratio for normal text according to WCAG AA?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "4.5:1", isCorrect: true }, { text: "3:1", isCorrect: false }, { text: "7:1", isCorrect: false }, { text: "2:1", isCorrect: false }] },
            { text: "What is a design token?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "A named design value like a color or spacing constant", isCorrect: true }, { text: "A unique icon in the design system", isCorrect: false }, { text: "A token used for user authentication", isCorrect: false }, { text: "A type of wireframe", isCorrect: false }] },
            { text: "Which reading pattern do users typically follow on the web?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "F-pattern", isCorrect: true }, { text: "Z-pattern", isCorrect: false }, { text: "Circular pattern", isCorrect: false }, { text: "Random pattern", isCorrect: false }] }
          ]
        }
      }
    ]
  },
  {
    title: "Figma for Designers",
    description: "Master Figma from basics to advanced. Learn vector editing, components, auto layout, variants, prototyping, collaboration, and plugin development for modern UI/UX workflows.",
    category: "UI/UX Design",
    isFree: true,
    modules: [
      {
        title: "Figma Fundamentals",
        lessons: [
          { title: "Interface & Vector Tools", duration: 25, videoUrl: "https://www.youtube.com/watch?v=FTFaQWZBqQ8", content: "<p>Figma is a browser-based UI design tool. Learn the interface: toolbar, layers panel, properties panel, canvas, and assets panel. Master navigation shortcuts.</p><p>Vector editing with the pen tool, boolean operations, vector networks, and corner smoothing. Create and edit shapes, paths, and curves.</p>" },
          { title: "Components & Variants", duration: 35, videoUrl: "https://www.youtube.com/watch?v=FTFaQWZBqQ8", content: "<p>Components are reusable design elements. Learn to create main components and instances, override properties, and swap instances. Understand component hierarchy.</p><p>Variants group similar components with different properties. Create interactive variants with hover, pressed, and disabled states. Use component properties for flexibility.</p>" },
          { title: "Auto Layout & Constraints", duration: 30, videoUrl: "https://www.youtube.com/watch?v=FTFaQWZBqQ8", content: "<p>Auto Layout makes designs responsive. Learn to add, configure, and nest auto layout frames. Understand padding, spacing, alignment, and resizing behavior.</p><p>Constraints determine how elements respond to frame resizing. Combine auto layout with constraints for complex responsive layouts.</p>" },
          { title: "Styles & Design Systems", duration: 25, videoUrl: "https://www.youtube.com/watch?v=FTFaQWZBqQ8", content: "<p>Create and manage design styles: color styles, text styles, effect styles, and grid styles. Publish styles to the team library.</p><p>Organize a design system with pages, sections, and naming conventions. Use local variables for themes and modes. Create dark and light mode variants.</p>" }
        ],
        quiz: {
          title: "Figma Fundamentals Quiz",
          passingScore: 70,
          questions: [
            { text: "What is the purpose of Auto Layout in Figma?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "To make designs responsive and automatically adjust to content", isCorrect: true }, { text: "To automatically align objects to the grid", isCorrect: false }, { text: "To generate code from designs", isCorrect: false }, { text: "To create animations", isCorrect: false }] },
            { text: "What are variants in Figma?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Different states or versions of a component grouped together", isCorrect: true }, { text: "Different color themes for the design", isCorrect: false }, { text: "Alternative layouts for responsive design", isCorrect: false }, { text: "Different export formats", isCorrect: false }] },
            { text: "How do you make a reusable element in Figma?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Create a component", isCorrect: true }, { text: "Group the elements", isCorrect: false }, { text: "Create a frame", isCorrect: false }, { text: "Use the pen tool", isCorrect: false }] },
            { text: "What is the difference between a style and a component?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Styles define visual properties, components are reusable elements with structure", isCorrect: true }, { text: "Styles are for text only, components are for shapes", isCorrect: false }, { text: "Components are static, styles are interactive", isCorrect: false }, { text: "There is no difference", isCorrect: false }] }
          ]
        }
      },
      {
        title: "Collaboration & Prototyping",
        lessons: [
          { title: "Prototyping & Interactions", duration: 30, videoUrl: "https://www.youtube.com/watch?v=FTFaQWZBqQ8", content: "<p>Create interactive prototypes with connections between frames. Learn trigger types: on click, on hover, on drag, while pressing, key press, after delay.</p><p>Add animations with smart animate, dissolve, move in/out, push, and slide. Use overflow scrolling, overlay, and navigation interactions.</p>" },
          { title: "Collaborative Workflows", duration: 25, videoUrl: "https://www.youtube.com/watch?v=FTFaQWZBqQ8", content: "<p>Figma's multiplayer feature enables real-time collaboration. Learn to share files, manage permissions, use branches for version control, and resolve merge conflicts.</p><p>Use comments for feedback, present designs in presentation view, and share prototypes with stakeholders. Integrate with Slack, Jira, and other tools.</p>" },
          { title: "Design Handoff & Developer Collaboration", duration: 25, videoUrl: "https://www.youtube.com/watch?v=FTFaQWZBqQ8", content: "<p>Prepare designs for development handoff. Learn to organize layers with clear naming, use component descriptions, export assets, and use Dev Mode features.</p><p>Inspect mode lets developers view CSS properties, measurements, and assets. Use links to connect designs to code components.</p>" },
          { title: "Plugins & Widgets", duration: 20, videoUrl: "https://www.youtube.com/watch?v=FTFaQWZBqQ8", content: "<p>Extend Figma's functionality with plugins. Browse and install plugins from the community. Learn about essential plugins: icon libraries, accessibility checkers, content generators.</p><p>Create custom plugins with the Figma Plugin API using TypeScript or JavaScript. Understand the plugin structure, UI elements, and how to manipulate the document.</p>" }
        ],
        quiz: {
          title: "Collaboration & Prototyping Quiz",
          passingScore: 70,
          questions: [
            { text: "What is the 'Smart Animate' feature used for?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Automatically animating transitions between matching layers", isCorrect: true }, { text: "Generating animations from code", isCorrect: false }, { text: "Optimizing animation performance", isCorrect: false }, { text: "Creating 3D animations", isCorrect: false }] },
            { text: "What is Dev Mode in Figma?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "A view optimized for developers to inspect designs and get code", isCorrect: true }, { text: "A mode for writing plugin code", isCorrect: false }, { text: "A dark mode for the interface", isCorrect: false }, { text: "A debugging tool for designs", isCorrect: false }] },
            { text: "How can you manage different versions of a Figma file?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Using version history and branches", isCorrect: true }, { text: "Saving multiple copies of the file", isCorrect: false }, { text: "Using the archive feature", isCorrect: false }, { text: "Exporting to PDF for each version", isCorrect: false }] }
          ]
        }
      }
    ]
  },
  {
    title: "Cybersecurity Essentials",
    description: "Learn cybersecurity fundamentals: network security, cryptography, threat analysis, penetration testing, and security best practices. Protect systems and data from cyber threats.",
    category: "Cybersecurity",
    isFree: true,
    modules: [
      {
        title: "Security Foundations",
        lessons: [
          { title: "Security Principles & CIA Triad", duration: 25, videoUrl: "https://www.youtube.com/watch?v=inWWhr5tnEA", content: "<p>The CIA triad is the foundation of information security: Confidentiality (data privacy), Integrity (data accuracy), and Availability (data accessible when needed).</p><p>Learn additional principles: authentication, authorization, non-repudiation, defense in depth, least privilege, separation of duties, and fail-safe defaults.</p>" },
          { title: "Network Security Fundamentals", duration: 35, videoUrl: "https://www.youtube.com/watch?v=inWWhr5tnEA", content: "<p>Secure network architecture with firewalls, intrusion detection/prevention systems (IDS/IPS), VPNs, and network segmentation. Understand OSI and TCP/IP models from a security perspective.</p><p>Learn common network attacks: SYN flood, DDoS, man-in-the-middle, ARP spoofing, DNS poisoning. Understand how each attack works and mitigation strategies.</p>" },
          { title: "Cryptography Basics", duration: 30, videoUrl: "https://www.youtube.com/watch?v=inWWhr5tnEA", content: "<p>Cryptography protects data through encryption. Learn symmetric encryption (AES, DES, ChaCha20), asymmetric encryption (RSA, ECC), and hash functions (SHA-256).</p><p>Understand digital signatures, certificates, PKI infrastructure, TLS/SSL protocols, and key management. Learn about quantum-resistant cryptography.</p>" },
          { title: "Authentication & Access Control", duration: 25, videoUrl: "https://www.youtube.com/watch?v=inWWhr5tnEA", content: "<p>Authentication verifies identity. Learn password-based authentication, multi-factor authentication (MFA), biometric authentication, and single sign-on (SSO) with SAML and OAuth.</p><p>Access control models: Discretionary (DAC), Mandatory (MAC), Role-Based (RBAC), and Attribute-Based (ABAC). Implement principle of least privilege.</p>" }
        ],
        quiz: {
          title: "Security Foundations Quiz",
          passingScore: 70,
          questions: [
            { text: "What does the 'I' in CIA triad stand for?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Integrity", isCorrect: true }, { text: "Identity", isCorrect: false }, { text: "Isolation", isCorrect: false }, { text: "Implementation", isCorrect: false }] },
            { text: "Which encryption type uses the same key for encryption and decryption?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Symmetric encryption", isCorrect: true }, { text: "Asymmetric encryption", isCorrect: false }, { text: "Hash function", isCorrect: false }, { text: "Digital signature", isCorrect: false }] },
            { text: "What is a DDoS attack?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Distributed Denial of Service - overwhelming a server with traffic", isCorrect: true }, { text: "Data Destruction of Service", isCorrect: false }, { text: "Dynamic Domain Ownership System", isCorrect: false }, { text: "Direct Download of Software", isCorrect: false }] },
            { text: "What is the principle of least privilege?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Users should only have access to what they need to do their job", isCorrect: true }, { text: "Users should have maximum access by default", isCorrect: false }, { text: "Privileges should be granted to the least number of users", isCorrect: false }, { text: "Administrators should have fewer privileges than regular users", isCorrect: false }] }
          ]
        }
      },
      {
        title: "Threat Analysis & Defense",
        lessons: [
          { title: "Vulnerability Assessment & Scanning", duration: 30, videoUrl: "https://www.youtube.com/watch?v=3Kq1MIfTWCE", content: "<p>Vulnerability assessment identifies security weaknesses. Learn scanning tools like Nmap for network discovery, Nessus and OpenVAS for vulnerability scanning.</p><p>Understand CVSS scoring system, CVE database, and patch management. Prioritize vulnerabilities based on risk and impact.</p>" },
          { title: "Penetration Testing Methodology", duration: 35, videoUrl: "https://www.youtube.com/watch?v=3Kq1MIfTWCE", content: "<p>Penetration testing simulates real attacks. Learn the methodology: reconnaissance, scanning, exploitation, privilege escalation, lateral movement, and reporting.</p><p>Tools: Metasploit for exploitation, Burp Suite for web testing, Wireshark for packet analysis. Understand ethical hacking principles and legal considerations.</p>" },
          { title: "Web Application Security", duration: 30, videoUrl: "https://www.youtube.com/watch?v=3Kq1MIfTWCE", content: "<p>Web applications are common attack targets. Learn OWASP Top 10: SQL injection, XSS, CSRF, SSRF, authentication flaws, and insecure deserialization.</p><p>Secure coding practices: input validation, output encoding, prepared statements, CSP headers, secure session management, and proper error handling.</p>" },
          { title: "Incident Response & Forensics", duration: 25, videoUrl: "https://www.youtube.com/watch?v=3Kq1MIfTWCE", content: "<p>Incident response handles security breaches. Learn the SANS PICERL framework: Preparation, Identification, Containment, Eradication, Recovery, Lessons Learned.</p><p>Digital forensics: evidence collection, chain of custody, disk imaging, memory analysis, log analysis. Understand legal requirements and reporting.</p>" }
        ],
        quiz: {
          title: "Threat Analysis Quiz",
          passingScore: 70,
          questions: [
            { text: "What is the difference between a vulnerability assessment and a penetration test?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Assessment identifies weaknesses, pentest actively exploits them", isCorrect: true }, { text: "Assessment is manual, pentest is automated", isCorrect: false }, { text: "Assessment costs more than pentest", isCorrect: false }, { text: "There is no difference", isCorrect: false }] },
            { text: "What is SQL injection?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Inserting malicious SQL code into user inputs to manipulate databases", isCorrect: true }, { text: "A tool for optimizing SQL queries", isCorrect: false }, { text: "A method for backing up databases", isCorrect: false }, { text: "A type of database index", isCorrect: false }] },
            { text: "In which phase of penetration testing does the actual exploitation happen?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Exploitation", isCorrect: true }, { text: "Reconnaissance", isCorrect: false }, { text: "Reporting", isCorrect: false }, { text: "Lateral Movement", isCorrect: false }] }
          ]
        }
      }
    ]
  },
  {
    title: "Ethical Hacking",
    description: "Master ethical hacking techniques. Learn to think like an attacker to better defend systems. Covering reconnaissance, exploitation, post-exploitation, and defensive countermeasures.",
    category: "Cybersecurity",
    isFree: true,
    modules: [
      {
        title: "Reconnaissance & Scanning",
        lessons: [
          { title: "Passive Reconnaissance", duration: 25, videoUrl: "https://www.youtube.com/watch?v=3Kq1MIfTWCE", content: "<p>Passive reconnaissance gathers information without directly interacting with the target. Learn OSINT techniques: Google dorking, Shodan, Censys, WHOIS lookups, DNS enumeration.</p><p>Use tools like theHarvester, Maltego, Recon-ng. Gather email addresses, subdomains, employee information, and technology stack details.</p>" },
          { title: "Active Reconnaissance & Port Scanning", duration: 30, videoUrl: "https://www.youtube.com/watch?v=3Kq1MIfTWCE", content: "<p>Active scanning probes the target directly. Master Nmap for port scanning: TCP connect, SYN scan, UDP scan, FIN scan, and OS fingerprinting. Understand stealth scanning techniques.</p><p>Use masscan for high-speed scanning. Identify open ports, running services, and operating systems. Banner grabbing with netcat and curl.</p>" },
          { title: "Vulnerability Scanning & Enumeration", duration: 30, videoUrl: "https://www.youtube.com/watch?v=3Kq1MIfTWCE", content: "<p>Enumerate services to find attack vectors. Learn SMB enumeration with smbclient and enum4linux, SNMP enumeration, LDAP enumeration, and NFS enumeration.</p><p>Use Nessus and OpenVAS for automated vulnerability scanning. Manual verification reduces false positives. Understand how to prioritize vulnerabilities.</p>" },
          { title: "Social Engineering Attacks", duration: 25, videoUrl: "https://www.youtube.com/watch?v=3Kq1MIfTWCE", content: "<p>Social engineering exploits human psychology. Learn phishing, spear-phishing, whaling, vishing, smishing, tailgating, and pretexting techniques.</p><p>Create convincing attack scenarios with SET (Social Engineering Toolkit). Understand how to train users to recognize and report social engineering attempts.</p>" }
        ],
        quiz: {
          title: "Reconnaissance Quiz",
          passingScore: 70,
          questions: [
            { text: "What is OSINT?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Open Source Intelligence - gathering data from publicly available sources", isCorrect: true }, { text: "Operating System Integration", isCorrect: false }, { text: "Online Security Interface", isCorrect: false }, { text: "Open Standard for Internet", isCorrect: false }] },
            { text: "Which Nmap scan type uses a half-open TCP connection?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "SYN scan (-sS)", isCorrect: true }, { text: "TCP connect scan (-sT)", isCorrect: false }, { text: "UDP scan (-sU)", isCorrect: false }, { text: "Ping scan (-sn)", isCorrect: false }] },
            { text: "What is Google dorking?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Using advanced Google search operators to find sensitive information", isCorrect: true }, { text: "A hacking tool used to attack Google", isCorrect: false }, { text: "A Google service for security researchers", isCorrect: false }, { text: "A type of phishing attack on Google accounts", isCorrect: false }] },
            { text: "What is the primary defense against social engineering?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "User training and awareness programs", isCorrect: true }, { text: "Firewalls and intrusion detection systems", isCorrect: false }, { text: "Strong password policies", isCorrect: false }, { text: "Encrypting all network traffic", isCorrect: false }] }
          ]
        }
      },
      {
        title: "Exploitation & Post-Exploitation",
        lessons: [
          { title: "Web Application Exploitation", duration: 35, videoUrl: "https://www.youtube.com/watch?v=3Kq1MIfTWCE", content: "<p>Exploit web vulnerabilities to gain access. Learn SQL injection techniques: blind SQLi, time-based, out-of-band. Use sqlmap for automation.</p><p>Cross-site scripting (XSS): stored, reflected, DOM-based. Cross-site request forgery (CSRF), server-side request forgery (SSRF), and file inclusion vulnerabilities.</p>" },
          { title: "Privilege Escalation", duration: 30, videoUrl: "https://www.youtube.com/watch?v=3Kq1MIfTWCE", content: "<p>After gaining initial access, escalate privileges. Linux: kernel exploits, SUID binaries, cron jobs, sudo misconfigurations, capabilities. Windows: unquoted service paths, DLL hijacking, token manipulation.</p><p>Use tools like LinPEAS, WinPEAS, BloodHound for enumeration. Understand common misconfigurations that allow privilege escalation.</p>" },
          { title: "Lateral Movement & Persistence", duration: 30, videoUrl: "https://www.youtube.com/watch?v=3Kq1MIfTWCE", content: "<p>Move through the network to reach high-value targets. Learn pass-the-hash, pass-the-ticket, PSExec, WMI, WinRM, and SSH tunneling techniques.</p><p>Establish persistence: cron jobs, scheduled tasks, registry run keys, services, SSH keys, web shells, and backdoors. Understand how to detect and remove persistence mechanisms.</p>" },
          { title: "Reporting & Responsible Disclosure", duration: 20, videoUrl: "https://www.youtube.com/watch?v=3Kq1MIfTWCE", content: "<p>Document findings with professional penetration testing reports. Learn report structure: executive summary, methodology, findings with risk ratings, evidence, and remediation recommendations.</p><p>Understand responsible disclosure processes, bug bounty programs, and legal boundaries. Certifications: CEH, OSCP, GPEN.</p>" }
        ],
        quiz: {
          title: "Exploitation Quiz",
          passingScore: 70,
          questions: [
            { text: "What is privilege escalation?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Gaining higher-level permissions than initially obtained", isCorrect: true }, { text: "Granting access to a new user", isCorrect: false }, { text: "Removing user privileges", isCorrect: false }, { text: "Auditing user permissions", isCorrect: false }] },
            { text: "What is a pass-the-hash attack?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Using NTLM hash to authenticate without knowing the plaintext password", isCorrect: true }, { text: "Stealing password hashes from the database", isCorrect: false }, { text: "Cracking password hashes with brute force", isCorrect: false }, { text: "Sending password hashes via email", isCorrect: false }] },
            { text: "Which of the following is an example of persistence?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Installing a web shell on the compromised server", isCorrect: true }, { text: "Running a port scan", isCorrect: false }, { text: "Pinging a remote host", isCorrect: false }, { text: "Cleaning up log files", isCorrect: false }] }
          ]
        }
      }
    ]
  },
  {
    title: "Docker & Kubernetes",
    description: "Master containerization and orchestration with Docker and Kubernetes. Learn to build, ship, and run distributed applications at scale in production environments.",
    category: "DevOps",
    isFree: true,
    modules: [
      {
        title: "Docker Fundamentals",
        lessons: [
          { title: "Containers & Images", duration: 30, videoUrl: "https://www.youtube.com/watch?v=3c-iBn73dDE", content: "<p>Docker containers are lightweight, portable units that package applications with dependencies. Learn the difference between containers and virtual machines, Docker architecture, and the container lifecycle.</p><p>Docker images are read-only templates. Learn Dockerfile instructions: FROM, RUN, COPY, ADD, CMD, ENTRYPOINT, EXPOSE, ENV, WORKDIR, USER, and HEALTHCHECK.</p>" },
          { title: "Docker Compose & Networking", duration: 30, videoUrl: "https://www.youtube.com/watch?v=3c-iBn73dDE", content: "<p>Docker Compose defines multi-container applications in YAML. Learn services, networks, volumes, environment variables, and dependencies. Use profiles for different environments.</p><p>Docker networking: bridge, host, overlay, macvlan networks. Understand port mapping, DNS resolution, and network isolation between containers.</p>" },
          { title: "Volumes & Data Persistence", duration: 25, videoUrl: "https://www.youtube.com/watch?v=3c-iBn73dDE", content: "<p>Containers are ephemeral. Learn volumes for persistent data: named volumes, bind mounts, tmpfs mounts. Understand volume drivers and backup strategies.</p><p>Use volumes for databases, configuration files, and shared data between containers. Access host files with bind mounts for development.</p>" },
          { title: "Multi-Stage Builds & Optimization", duration: 25, videoUrl: "https://www.youtube.com/watch?v=3c-iBn73dDE", content: "<p>Multi-stage builds reduce image size by separating build and runtime environments. Learn to use multiple FROM statements, copy artifacts between stages, and use distroless or alpine base images.</p><p>Best practices: layer caching, minimal layers, .dockerignore, security scanning with Docker Scout, and image signing with Docker Content Trust.</p>" }
        ],
        quiz: {
          title: "Docker Quiz",
          passingScore: 70,
          questions: [
            { text: "What is the difference between an image and a container?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "An image is a read-only template, a container is a running instance", isCorrect: true }, { text: "An image is running, a container is stored", isCorrect: false }, { text: "There is no difference", isCorrect: false }, { text: "Images are for production, containers are for development", isCorrect: false }] },
            { text: "Which Dockerfile instruction runs commands during image build?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "RUN", isCorrect: true }, { text: "CMD", isCorrect: false }, { text: "ENTRYPOINT", isCorrect: false }, { text: "STARTUP", isCorrect: false }] },
            { text: "What is Docker Compose used for?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Defining and running multi-container Docker applications", isCorrect: true }, { text: "Building single container images", isCorrect: false }, { text: "Monitoring Docker containers", isCorrect: false }, { text: "Deploying to Kubernetes", isCorrect: false }] },
            { text: "What is the purpose of a multi-stage build?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "To reduce image size by separating build and runtime dependencies", isCorrect: true }, { text: "To build multiple images in parallel", isCorrect: false }, { text: "To deploy to multiple environments", isCorrect: false }, { text: "To run multiple services in one container", isCorrect: false }] }
          ]
        }
      },
      {
        title: "Kubernetes Orchestration",
        lessons: [
          { title: "Kubernetes Architecture & Pods", duration: 35, videoUrl: "https://www.youtube.com/watch?v=X48VuDVv0do", content: "<p>Kubernetes orchestrates containerized applications. Learn architecture: control plane (API server, scheduler, controller manager, etcd) and worker nodes (kubelet, kube-proxy, container runtime).</p><p>Pods are the smallest deployable units. Learn pod specifications, multi-container pods, init containers, sidecar containers, and pod lifecycle.</p>" },
          { title: "Deployments & Services", duration: 30, videoUrl: "https://www.youtube.com/watch?v=X48VuDVv0do", content: "<p>Deployments manage replica sets and rolling updates. Learn deployment strategies: rolling update, recreate, blue/green, canary. Understand rollout history and rollbacks.</p><p>Services provide stable network endpoints. Learn ClusterIP, NodePort, LoadBalancer, and ExternalName services. Understand kube-proxy and service discovery.</p>" },
          { title: "ConfigMaps, Secrets & Storage", duration: 25, videoUrl: "https://www.youtube.com/watch?v=X48VuDVv0do", content: "<p>ConfigMaps store non-sensitive configuration as key-value pairs. Secrets store sensitive data like passwords and API keys, encoded in base64 with optional encryption at rest.</p><p>Storage in Kubernetes: PersistentVolume (PV), PersistentVolumeClaim (PVC), StorageClass. Understand dynamic provisioning, access modes, and stateful applications with StatefulSets.</p>" },
          { title: "Ingress, Helm & Monitoring", duration: 30, videoUrl: "https://www.youtube.com/watch?v=X48VuDVv0do", content: "<p>Ingress controllers route external traffic to services. Learn Ingress resources with TLS termination, path-based routing, and annotations for various ingress controllers like NGINX and Traefik.</p><p>Helm packages Kubernetes applications as charts. Learn chart structure, templating, values, and releases. Monitor clusters with Prometheus and Grafana, visualize with Kubernetes Dashboard.</p>" }
        ],
        quiz: {
          title: "Kubernetes Quiz",
          passingScore: 70,
          questions: [
            { text: "What is the smallest deployable unit in Kubernetes?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Pod", isCorrect: true }, { text: "Container", isCorrect: false }, { text: "Deployment", isCorrect: false }, { text: "Service", isCorrect: false }] },
            { text: "What is the purpose of a Kubernetes Service?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "To provide stable network access to a set of pods", isCorrect: true }, { text: "To store application configuration", isCorrect: false }, { text: "To schedule pods on nodes", isCorrect: false }, { text: "To manage storage volumes", isCorrect: false }] },
            { text: "What is a ConfigMap used for?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Storing non-sensitive configuration data as key-value pairs", isCorrect: true }, { text: "Storing encrypted secrets", isCorrect: false }, { text: "Defining network policies", isCorrect: false }, { text: "Creating persistent volumes", isCorrect: false }] },
            { text: "What is Helm in the Kubernetes ecosystem?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "A package manager for Kubernetes applications", isCorrect: true }, { text: "A monitoring tool", isCorrect: false }, { text: "A container runtime", isCorrect: false }, { text: "A service mesh implementation", isCorrect: false }] }
          ]
        }
      }
    ]
  },
  {
    title: "AWS Cloud Practitioner",
    description: "Prepare for the AWS Certified Cloud Practitioner exam. Learn AWS global infrastructure, core services, pricing models, security, and architectural best practices.",
    category: "Cloud Computing",
    isFree: true,
    modules: [
      {
        title: "AWS Core Services",
        lessons: [
          { title: "Global Infrastructure & Regions", duration: 25, videoUrl: "https://www.youtube.com/watch?v=3hLDSDS0kHE", content: "<p>AWS global infrastructure spans 30+ geographic regions and 90+ availability zones. Learn about regions, availability zones, edge locations, and Local Zones.</p><p>Understand how to choose regions based on latency, compliance, cost, and service availability. Learn about the AWS Shared Responsibility Model.</p>" },
          { title: "Compute Services: EC2, Lambda & ECS", duration: 30, videoUrl: "https://www.youtube.com/watch?v=3hLDSDS0kHE", content: "<p>Amazon EC2 provides virtual servers in the cloud. Learn instance types, AMIs, security groups, key pairs, user data, and purchase options (on-demand, reserved, spot, dedicated).</p><p>Serverless with AWS Lambda: functions, triggers, execution environment, and pricing. Elastic Container Service (ECS) for Docker containers with Fargate serverless compute.</p>" },
          { title: "Storage: S3, EBS & RDS", duration: 30, videoUrl: "https://www.youtube.com/watch?v=3hLDSDS0kHE", content: "<p>Amazon S3 provides scalable object storage. Learn bucket policies, versioning, lifecycle rules, replication, storage classes (Standard, Infrequent Access, Glacier), and S3 Select.</p><p>EBS for block-level storage volumes attached to EC2. RDS for managed relational databases: MySQL, PostgreSQL, MariaDB, Oracle, SQL Server, and Aurora.</p>" },
          { title: "Networking: VPC, CloudFront & Route 53", duration: 30, videoUrl: "https://www.youtube.com/watch?v=3hLDSDS0kHE", content: "<p>Amazon VPC provides isolated virtual networks. Learn subnets, route tables, internet gateways, NAT gateways, VPC peering, and security groups vs network ACLs.</p><p>CloudFront is a content delivery network with edge caching. Route 53 is a DNS service with routing policies: simple, weighted, latency, failover, geolocation, geoproximity.</p>" }
        ],
        quiz: {
          title: "AWS Core Services Quiz",
          passingScore: 70,
          questions: [
            { text: "What is an Availability Zone in AWS?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "A distinct location within a region with isolated power and networking", isCorrect: true }, { text: "A geographic area containing multiple regions", isCorrect: false }, { text: "An edge location for content delivery", isCorrect: false }, { text: "A logical grouping of AWS accounts", isCorrect: false }] },
            { text: "Which AWS service provides serverless compute?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "AWS Lambda", isCorrect: true }, { text: "Amazon EC2", isCorrect: false }, { text: "Amazon RDS", isCorrect: false }, { text: "Amazon S3", isCorrect: false }] },
            { text: "What is the cheapest S3 storage class for archival data?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "S3 Glacier Deep Archive", isCorrect: true }, { text: "S3 Standard", isCorrect: false }, { text: "S3 Intelligent-Tiering", isCorrect: false }, { text: "S3 One Zone-IA", isCorrect: false }] },
            { text: "What does IAM stand for in AWS?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Identity and Access Management", isCorrect: true }, { text: "Infrastructure and Monitoring", isCorrect: false }, { text: "Integrated Application Manager", isCorrect: false }, { text: "Instance Access Module", isCorrect: false }] }
          ]
        }
      },
      {
        title: "Security, Pricing & Architecture",
        lessons: [
          { title: "IAM, Security & Compliance", duration: 30, videoUrl: "https://www.youtube.com/watch?v=3hLDSDS0kHE", content: "<p>AWS Identity and Access Management (IAM) controls access. Learn users, groups, roles, policies (managed vs inline), and trust relationships. Understand ARN format and policy evaluation logic.</p><p>Security services: AWS Shield for DDoS protection, WAF for web application firewall, GuardDuty for threat detection, Inspector for vulnerability scanning, and KMS for encryption key management.</p>" },
          { title: "AWS Pricing & Support Plans", duration: 25, videoUrl: "https://www.youtube.com/watch?v=3hLDSDS0kHE", content: "<p>AWS pricing models: pay-as-you-go, reserved instances, savings plans, and spot instances. Understand the AWS Free Tier, consolidated billing, AWS Budgets, Cost Explorer, and the Total Cost of Ownership (TCO) calculator.</p><p>Support plans: Basic, Developer, Business, Enterprise On-Ramp, Enterprise. Understand SLAs, technical account managers, and Concierge support team.</p>" },
          { title: "Well-Architected Framework", duration: 25, videoUrl: "https://www.youtube.com/watch?v=3hLDSDS0kHE", content: "<p>The AWS Well-Architected Framework provides best practices. Six pillars: Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, and Sustainability.</p><p>Learn the design principles, key questions, and implementation guidance for each pillar. Use the Well-Architected Tool for reviews.</p>" },
          { title: "Migration & Hybrid Architecture", duration: 20, videoUrl: "https://www.youtube.com/watch?v=3hLDSDS0kHE", content: "<p>Migrate on-premises workloads to AWS. Learn the 7 Rs: Retire, Retain, Rehost, Replatform, Refactor, Relocate, and Repurchase. Use AWS Migration Hub, Server Migration Service, and Database Migration Service.</p><p>Hybrid architectures: AWS Direct Connect for dedicated network connections, Storage Gateway for hybrid storage, and AWS Outposts for on-premises AWS infrastructure.</p>" }
        ],
        quiz: {
          title: "Security & Pricing Quiz",
          passingScore: 70,
          questions: [
            { text: "What is the purpose of a VPC endpoint?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "To privately connect VPC to AWS services without internet", isCorrect: true }, { text: "To connect VPC to on-premises data center", isCorrect: false }, { text: "To terminate VPN connections", isCorrect: false }, { text: "To distribute traffic across instances", isCorrect: false }] },
            { text: "Which AWS support plan provides a Technical Account Manager?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Enterprise", isCorrect: true }, { text: "Business", isCorrect: false }, { text: "Developer", isCorrect: false }, { text: "Basic", isCorrect: false }] },
            { text: "What is the AWS Well-Architected Framework?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "A set of best practices for designing reliable and secure cloud architectures", isCorrect: true }, { text: "A certification for AWS architects", isCorrect: false }, { text: "A tool for monitoring AWS costs", isCorrect: false }, { text: "A compliance standard for cloud providers", isCorrect: false }] }
          ]
        }
      }
    ]
  },
  {
    title: "Android Development",
    description: "Build native Android apps with Kotlin and Jetpack Compose. Learn activity lifecycle, navigation, data persistence, networking, and publish your apps to Google Play Store.",
    category: "Mobile Development",
    isFree: true,
    modules: [
      {
        title: "Kotlin & Android Basics",
        lessons: [
          { title: "Kotlin Fundamentals", duration: 30, videoUrl: "https://www.youtube.com/watch?v=BB77GeRcPqM", content: "<p>Kotlin is a modern JVM language for Android. Learn syntax: variables (val vs var), null safety with nullable types and the safe call operator, type inference, string templates, and when expressions.</p><p>Object-oriented programming: classes, data classes, sealed classes, inheritance, interfaces, and companion objects. Functional programming: lambda expressions, higher-order functions, and extension functions.</p>" },
          { title: "Android Studio & Project Structure", duration: 25, videoUrl: "https://www.youtube.com/watch?v=BB77GeRcPqM", content: "<p>Android Studio is the official IDE. Learn project structure: app module, manifests, Java/Kotlin source, resources (res), and Gradle build system. Understand AndroidManifest.xml, build.gradle files, and the R resource class.</p><p>Set up emulators and physical devices for testing. Learn debugging tools: Logcat, breakpoints, Profiler, and Layout Inspector.</p>" },
          { title: "Activities, Fragments & Lifecycle", duration: 35, videoUrl: "https://www.youtube.com/watch?v=BB77GeRcPqM", content: "<p>Activities represent screens in Android. Learn the activity lifecycle: onCreate, onStart, onResume, onPause, onStop, onDestroy, and onRestart. Understand configuration changes and saved instance state.</p><p>Fragments are reusable UI components within activities. Learn fragment lifecycle, fragment manager, and fragment transactions. Best practices for handling configuration changes.</p>" },
          { title: "Jetpack Compose UI", duration: 30, videoUrl: "https://www.youtube.com/watch?v=BB77GeRcPqM", content: "<p>Jetpack Compose is a modern declarative UI toolkit. Learn composable functions, modifiers, state management with remember and mutableStateOf, and recomposition.</p><p>Build layouts with Column, Row, Box, and LazyColumn. Use Material 3 components: TopAppBar, Scaffold, BottomNavigation, Button, TextField, and Card.</p>" }
        ],
        quiz: {
          title: "Android Basics Quiz",
          passingScore: 70,
          questions: [
            { text: "What is the purpose of the activity lifecycle in Android?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "To manage the state of an activity as the user navigates", isCorrect: true }, { text: "To define the visual layout of the screen", isCorrect: false }, { text: "To handle network requests", isCorrect: false }, { text: "To manage database connections", isCorrect: false }] },
            { text: "Which file contains the requested permissions and components of an Android app?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "AndroidManifest.xml", isCorrect: true }, { text: "build.gradle", isCorrect: false }, { text: "MainActivity.kt", isCorrect: false }, { text: "strings.xml", isCorrect: false }] },
            { text: "What is Jetpack Compose?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "A modern declarative UI toolkit for Android", isCorrect: true }, { text: "A library for background tasks", isCorrect: false }, { text: "A navigation library", isCorrect: false }, { text: "A testing framework", isCorrect: false }] },
            { text: "What does the '?' operator do in Kotlin?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Allows a variable to hold null values (nullable type)", isCorrect: true }, { text: "Performs a null check", isCorrect: false }, { text: "Creates a conditional expression", isCorrect: false }, { text: "Defines a default parameter", isCorrect: false }] }
          ]
        }
      },
      {
        title: "Data & Networking",
        lessons: [
          { title: "Room Database & SQLite", duration: 30, videoUrl: "https://www.youtube.com/watch?v=BB77GeRcPqM", content: "<p>Room is an ORM for SQLite databases in Android. Learn entities, DAOs (Data Access Objects), database class, and type converters. Understand migrations and testing.</p><p>Use Flow and LiveData for reactive database queries. Learn about RxJava and coroutines for asynchronous database operations.</p>" },
          { title: "Retrofit & Network Calls", duration: 30, videoUrl: "https://www.youtube.com/watch?v=BB77GeRcPqM", content: "<p>Retrofit is a type-safe HTTP client for Android. Define API interfaces with annotations for GET, POST, PUT, DELETE endpoints. Use Gson or Moshi for JSON serialization.</p><p>Combine Retrofit with coroutines for asynchronous network calls. Handle errors with sealed classes. Use OkHttp interceptors for logging, headers, and caching.</p>" },
          { title: "Navigation Component", duration: 25, videoUrl: "https://www.youtube.com/watch?v=BB77GeRcPqM", content: "<p>The Navigation Component simplifies in-app navigation. Define navigation graph as XML with destinations and actions. Use NavigationUI with bottom navigation and drawer layout.</p><p>Pass data between destinations with Safe Args. Understand deep linking, back stack management, and the navigation editor in Android Studio.</p>" },
          { title: "Publishing to Google Play", duration: 20, videoUrl: "https://www.youtube.com/watch?v=BB77GeRcPqM", content: "<p>Prepare your app for release. Learn signing configuration with upload key and app signing by Google Play. Generate signed AAB (Android App Bundle) for distribution.</p><p>Google Play Console: create store listing with screenshots, descriptions, and pricing. Manage releases with internal, alpha, beta, and production tracks. Monitor with Google Play Console insights.</p>" }
        ],
        quiz: {
          title: "Data & Networking Quiz",
          passingScore: 70,
          questions: [
            { text: "What is Room in Android development?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "A persistence library providing an abstraction layer over SQLite", isCorrect: true }, { text: "A UI layout container", isCorrect: false }, { text: "A networking library", isCorrect: false }, { text: "A dependency injection framework", isCorrect: false }] },
            { text: "What is Retrofit used for?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Making HTTP requests with a type-safe API interface", isCorrect: true }, { text: "Managing navigation between screens", isCorrect: false }, { text: "Creating Room databases", isCorrect: false }, { text: "Handling permissions", isCorrect: false }] },
            { text: "What is the purpose of the Navigation Component?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "To simplify implementing navigation between app screens", isCorrect: true }, { text: "To manage network calls", isCorrect: false }, { text: "To store data locally", isCorrect: false }, { text: "To handle user authentication", isCorrect: false }] }
          ]
        }
      }
    ]
  },
  {
    title: "SQL & Database Design",
    description: "Master SQL and relational database design. Learn normalization, indexing, query optimization, transactions, and work with PostgreSQL, MySQL, and SQL Server.",
    category: "Database Design",
    isFree: true,
    modules: [
      {
        title: "SQL Fundamentals",
        lessons: [
          { title: "DDL: Creating Tables & Constraints", duration: 25, videoUrl: "https://www.youtube.com/watch?v=HXV3zeQKqGY", content: "<p>Data Definition Language (DDL) defines database structure. Learn CREATE TABLE with column types (INT, VARCHAR, TEXT, BOOLEAN, DATE, TIMESTAMP, JSON, UUID), NOT NULL, DEFAULT, UNIQUE, PRIMARY KEY, and FOREIGN KEY constraints.</p><p>ALTER TABLE for schema changes, DROP TABLE, TRUNCATE. Understand schema design considerations and naming conventions.</p>" },
          { title: "DML: CRUD Operations", duration: 25, videoUrl: "https://www.youtube.com/watch?v=HXV3zeQKqGY", content: "<p>Data Manipulation Language (DML) manages data. SELECT with WHERE, ORDER BY, LIMIT, OFFSET. INSERT with single and multiple rows, INSERT from SELECT. UPDATE with conditions. DELETE vs TRUNCATE vs DROP.</p><p>Use RETURNING clause for getting affected rows. Understand the difference between DELETE and TRUNCATE in terms of performance and transaction handling.</p>" },
          { title: "JOINs & Subqueries", duration: 35, videoUrl: "https://www.youtube.com/watch?v=HXV3zeQKqGY", content: "<p>JOINs combine data from multiple tables. INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL OUTER JOIN, CROSS JOIN, and self-joins. Understand join conditions and table aliases.</p><p>Subqueries in WHERE, FROM, and SELECT clauses. Correlated subqueries. Use EXISTS, IN, ANY, ALL operators. CTEs (Common Table Expressions) with WITH clause for readable queries.</p>" },
          { title: "Aggregation & Window Functions", duration: 30, videoUrl: "https://www.youtube.com/watch?v=HXV3zeQKqGY", content: "<p>Aggregate functions: COUNT, SUM, AVG, MIN, MAX with GROUP BY and HAVING. Understand NULL handling in aggregations and grouping by multiple columns.</p><p>Window functions perform calculations across rows related to the current row. ROW_NUMBER, RANK, DENSE_RANK, NTILE, LAG, LEAD, FIRST_VALUE, LAST_VALUE. PARTITION BY and ORDER BY in OVER clause.</p>" }
        ],
        quiz: {
          title: "SQL Fundamentals Quiz",
          passingScore: 70,
          questions: [
            { text: "Which SQL clause filters groups after aggregation?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "HAVING", isCorrect: true }, { text: "WHERE", isCorrect: false }, { text: "FILTER", isCorrect: false }, { text: "GROUP BY", isCorrect: false }] },
            { text: "What does LEFT JOIN return?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "All rows from left table and matching rows from right table", isCorrect: true }, { text: "Only matching rows from both tables", isCorrect: false }, { text: "All rows from both tables", isCorrect: false }, { text: "All rows from right table and matching rows from left table", isCorrect: false }] },
            { text: "What is a CTE in SQL?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "A temporary named result set defined with WITH clause", isCorrect: true }, { text: "A type of index", isCorrect: false }, { text: "A database constraint", isCorrect: false }, { text: "A transaction isolation level", isCorrect: false }] },
            { text: "Which window function assigns a unique sequential number to each row?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "ROW_NUMBER", isCorrect: true }, { text: "RANK", isCorrect: false }, { text: "DENSE_RANK", isCorrect: false }, { text: "NTILE", isCorrect: false }] }
          ]
        }
      },
      {
        title: "Database Design & Performance",
        lessons: [
          { title: "Normalization & ER Diagrams", duration: 30, videoUrl: "https://www.youtube.com/watch?v=HXV3zeQKqGY", content: "<p>Normalization reduces data redundancy. Learn 1NF (atomic values), 2NF (no partial dependencies), 3NF (no transitive dependencies), BCNF, and higher normal forms. Understand when to denormalize for performance.</p><p>Entity-Relationship (ER) diagrams model database structure. Learn entities, attributes, relationships (one-to-one, one-to-many, many-to-many), and cardinality notation.</p>" },
          { title: "Indexing Strategy & Query Optimization", duration: 35, videoUrl: "https://www.youtube.com/watch?v=HXV3zeQKqGY", content: "<p>Indexes speed up query performance at the cost of write speed. Learn B-tree indexes, hash indexes, composite indexes, covering indexes, partial indexes, and expression indexes.</p><p>Use EXPLAIN and EXPLAIN ANALYZE to understand query plans. Identify full table scans, index scans, index-only scans. Optimize slow queries with proper indexing and query rewriting.</p>" },
          { title: "Transactions & Concurrency Control", duration: 30, videoUrl: "https://www.youtube.com/watch?v=HXV3zeQKqGY", content: "<p>Transactions ensure ACID properties: Atomicity, Consistency, Isolation, Durability. BEGIN, COMMIT, ROLLBACK, SAVEPOINT. Understand concurrency issues: dirty reads, non-repeatable reads, phantom reads.</p><p>Isolation levels: Read Uncommitted, Read Committed, Repeatable Read, Serializable. Learn how PostgreSQL implements MVCC (Multi-Version Concurrency Control) and row-level locking.</p>" },
          { title: "NoSQL Databases Overview", duration: 20, videoUrl: "https://www.youtube.com/watch?v=HXV3zeQKqGY", content: "<p>NoSQL databases offer flexible schemas for specific use cases. Document stores (MongoDB), key-value stores (Redis), column-family stores (Cassandra), graph databases (Neo4j).</p><p>Compare with relational databases: consistency models, query capabilities, scalability patterns. Understand when to use SQL vs NoSQL.</p>" }
        ],
        quiz: {
          title: "Database Design Quiz",
          passingScore: 70,
          questions: [
            { text: "What is the purpose of database normalization?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "To reduce data redundancy and improve data integrity", isCorrect: true }, { text: "To increase query speed", isCorrect: false }, { text: "To make the database smaller on disk", isCorrect: false }, { text: "To simplify SQL syntax", isCorrect: false }] },
            { text: "What does EXPLAIN in PostgreSQL show?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "The query execution plan", isCorrect: true }, { text: "The table structure", isCorrect: false }, { text: "The error log", isCorrect: false }, { text: "The index definitions", isCorrect: false }] },
            { text: "What does the 'I' in ACID stand for?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Isolation", isCorrect: true }, { text: "Indexing", isCorrect: false }, { text: "Integrity", isCorrect: false }, { text: "Idempotency", isCorrect: false }] },
            { text: "Which is an example of a NoSQL document database?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "MongoDB", isCorrect: true }, { text: "PostgreSQL", isCorrect: false }, { text: "MySQL", isCorrect: false }, { text: "SQLite", isCorrect: false }] }
          ]
        }
      }
    ]
  },
  {
    title: "Business Strategy",
    description: "Learn strategic thinking and business planning. Understand competitive analysis, business models, growth strategies, financial planning, and how to build sustainable competitive advantage.",
    category: "Business",
    isFree: true,
    modules: [
      {
        title: "Strategic Foundations",
        lessons: [
          { title: "Competitive Analysis & Positioning", duration: 30, videoUrl: "https://www.youtube.com/watch?v=2vDy4Rft9jk", content: "<p>Understand your competitive landscape. Learn Porter's Five Forces: threat of new entrants, bargaining power of buyers, bargaining power of suppliers, threat of substitutes, and industry rivalry.</p><p>Positioning strategies: cost leadership, differentiation, and focus. Create a positioning statement and value proposition canvas.</p>" },
          { title: "Business Model Canvas", duration: 25, videoUrl: "https://www.youtube.com/watch?v=2vDy4Rft9jk", content: "<p>The Business Model Canvas visualizes nine building blocks: customer segments, value propositions, channels, customer relationships, revenue streams, key resources, key activities, key partnerships, and cost structure.</p><p>Learn how to build and iterate on your business model. Case studies of successful companies and their business model innovations.</p>" },
          { title: "SWOT & PESTEL Analysis", duration: 25, videoUrl: "https://www.youtube.com/watch?v=2vDy4Rft9jk", content: "<p>SWOT analysis evaluates Strengths, Weaknesses, Opportunities, and Threats. Use it to identify strategic options and prioritize initiatives.</p><p>PESTEL analysis examines macro-environmental factors: Political, Economic, Social, Technological, Environmental, and Legal. Combine with SWOT for comprehensive strategic analysis.</p>" },
          { title: "Blue Ocean Strategy", duration: 20, videoUrl: "https://www.youtube.com/watch?v=2vDy4Rft9jk", content: "<p>Blue Ocean Strategy creates uncontested market space. Learn the strategy canvas, four actions framework (Eliminate, Reduce, Raise, Create), and the ERRC grid.</p><p>Case studies of companies that created new market spaces: Cirque du Soleil, Nintendo Wii, Yellow Tail wine. Understand how to apply the framework to your business.</p>" }
        ],
        quiz: {
          title: "Strategic Foundations Quiz",
          passingScore: 70,
          questions: [
            { text: "What are Porter's Five Forces used for?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Analyzing industry competitiveness and profitability", isCorrect: true }, { text: "Evaluating employee performance", isCorrect: false }, { text: "Setting product prices", isCorrect: false }, { text: "Designing organizational structure", isCorrect: false }] },
            { text: "What does SWOT stand for?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Strengths, Weaknesses, Opportunities, Threats", isCorrect: true }, { text: "Strategy, Workflow, Operations, Tactics", isCorrect: false }, { text: "Sales, Workforce, Organization, Technology", isCorrect: false }, { text: "Structure, Work, Objectives, Targets", isCorrect: false }] },
            { text: "What is the primary goal of Blue Ocean Strategy?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Creating new market space where competition is irrelevant", isCorrect: true }, { text: "Beating competitors in existing markets", isCorrect: false }, { text: "Reducing operational costs", isCorrect: false }, { text: "Expanding into international markets", isCorrect: false }] },
            { text: "What does PESTEL analyze?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "External macro-environmental factors affecting a business", isCorrect: true }, { text: "Internal company financial metrics", isCorrect: false }, { text: "Supply chain efficiency", isCorrect: false }, { text: "Employee satisfaction levels", isCorrect: false }] }
          ]
        }
      },
      {
        title: "Execution & Growth",
        lessons: [
          { title: "OKRs & Strategic Execution", duration: 30, videoUrl: "https://www.youtube.com/watch?v=2vDy4Rft9jk", content: "<p>OKRs (Objectives and Key Results) align teams around measurable goals. Learn to write effective objectives (aspirational, qualitative) and key results (quantitative, measurable).</p><p>Cascade OKRs from company level to team and individual levels. Track progress with regular check-ins and scoring. Avoid common OKR pitfalls.</p>" },
          { title: "Growth Strategies & Scaling", duration: 30, videoUrl: "https://www.youtube.com/watch?v=2vDy4Rft9jk", content: "<p>Growth strategies: market penetration, market development, product development, diversification (Ansoff Matrix). Organic vs inorganic growth through mergers and acquisitions.</p><p>Scaling challenges: maintaining culture, hiring, operational efficiency, and cash flow management. Learn about economies of scale and scope.</p>" },
          { title: "Financial Planning & KPIs", duration: 25, videoUrl: "https://www.youtube.com/watch?v=2vDy4Rft9jk", content: "<p>Understand financial statements: income statement, balance sheet, cash flow statement. Key metrics: revenue, gross margin, net profit, CAC, LTV, churn rate, ARR, MRR.</p><p>Build financial projections: revenue forecasting, expense budgeting, break-even analysis, and unit economics. Make data-driven strategic decisions.</p>" },
          { title: "Innovation & Change Management", duration: 25, videoUrl: "https://www.youtube.com/watch?v=2vDy4Rft9jk", content: "<p>Foster innovation in organizations. Learn types of innovation: incremental, disruptive, radical, architectural. Understand Rogers' Diffusion of Innovation and the technology adoption lifecycle.</p><p>Change management: Kotter's 8-step model, ADKAR model. Overcome resistance to change, communicate effectively, and lead organizational transformation.</p>" }
        ],
        quiz: {
          title: "Execution & Growth Quiz",
          passingScore: 70,
          questions: [
            { text: "What does OKR stand for?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Objectives and Key Results", isCorrect: true }, { text: "Operations and Key Resources", isCorrect: false }, { text: "Organizational Knowledge Repository", isCorrect: false }, { text: "Outcome and Key Requirements", isCorrect: false }] },
            { text: "What does CAC stand for in business metrics?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Customer Acquisition Cost", isCorrect: true }, { text: "Capital Allocation Cost", isCorrect: false }, { text: "Competitive Advantage Calculation", isCorrect: false }, { text: "Cost Accounting Center", isCorrect: false }] },
            { text: "Which matrix helps analyze growth strategies based on markets and products?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Ansoff Matrix", isCorrect: true }, { text: "BCG Matrix", isCorrect: false }, { text: "GE McKinsey Matrix", isCorrect: false }, { text: "Porter's Five Forces", isCorrect: false }] }
          ]
        }
      }
    ]
  },
  {
    title: "Digital Marketing",
    description: "Master digital marketing channels: SEO, SEM, social media, email marketing, content marketing, and analytics. Drive traffic, generate leads, and grow your online presence.",
    category: "Marketing",
    isFree: true,
    modules: [
      {
        title: "Marketing Channels & Strategy",
        lessons: [
          { title: "Content Marketing & SEO", duration: 30, videoUrl: "https://www.youtube.com/watch?v=8Dq1X3Gz_iM", content: "<p>Content marketing attracts and retains customers through valuable content. Learn content strategy, blog writing, pillar pages, topic clusters, and content repurposing.</p><p>SEO (Search Engine Optimization): on-page SEO (title tags, meta descriptions, headers, keyword optimization), technical SEO (site speed, mobile-friendliness, structured data), off-page SEO (backlinks, social signals).</p>" },
          { title: "Social Media Marketing", duration: 25, videoUrl: "https://www.youtube.com/watch?v=8Dq1X3Gz_iM", content: "<p>Social media platforms for business: Facebook, Instagram, LinkedIn, Twitter, TikTok, Pinterest. Learn platform-specific best practices, content formats, and posting strategies.</p><p>Paid social: Facebook Ads Manager, targeting options, ad formats, bidding strategies, and retargeting. Measure ROI with pixel tracking and conversion attribution.</p>" },
          { title: "Email Marketing & Automation", duration: 25, videoUrl: "https://www.youtube.com/watch?v=8Dq1X3Gz_iM", content: "<p>Build and segment email lists. Learn newsletter best practices, subject line optimization, personalization, and automated email sequences (welcome, nurture, abandoned cart, re-engagement).</p><p>Metrics: open rate, click-through rate, conversion rate, bounce rate, unsubscribe rate. A/B test subject lines, content, and send times. Use tools like Mailchimp, ConvertKit, or HubSpot.</p>" },
          { title: "PPC & Search Engine Marketing", duration: 30, videoUrl: "https://www.youtube.com/watch?v=8Dq1X3Gz_iM", content: "<p>Google Ads: search campaigns, display campaigns, shopping campaigns, video campaigns. Learn keyword research, ad copywriting, quality score, bid management, and ad extensions.</p><p>Understand auction dynamics, impression share, and budget optimization. Track conversions with Google Analytics and Google Tag Manager. Calculate ROAS and CAC.</p>" }
        ],
        quiz: {
          title: "Marketing Channels Quiz",
          passingScore: 70,
          questions: [
            { text: "What is SEO?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "The practice of optimizing websites to rank higher in search results", isCorrect: true }, { text: "A paid advertising platform", isCorrect: false }, { text: "A social media management tool", isCorrect: false }, { text: "An email marketing service", isCorrect: false }] },
            { text: "What does CTR stand for in digital marketing?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Click-Through Rate", isCorrect: true }, { text: "Cost to Revenue", isCorrect: false }, { text: "Conversion Tracking Ratio", isCorrect: false }, { text: "Campaign Traffic Report", isCorrect: false }] },
            { text: "What is the main advantage of email marketing automation?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Sending targeted messages triggered by user behavior automatically", isCorrect: true }, { text: "Sending the same email to everyone at once", isCorrect: false }, { text: "Eliminating the need for content creation", isCorrect: false }, { text: "Guaranteeing 100% open rate", isCorrect: false }] },
            { text: "What is a quality score in Google Ads?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "A metric estimating the relevance of keywords, ads, and landing pages", isCorrect: true }, { text: "The rating of ad design quality", isCorrect: false }, { text: "The number of clicks an ad receives", isCorrect: false }, { text: "The total ad spend budget", isCorrect: false }] }
          ]
        }
      },
      {
        title: "Analytics & Optimization",
        lessons: [
          { title: "Google Analytics & Data Analysis", duration: 30, videoUrl: "https://www.youtube.com/watch?v=8Dq1X3Gz_iM", content: "<p>Google Analytics tracks website traffic and user behavior. Learn to set up GA4 properties, understand reports: real-time, acquisition, engagement, monetization, and retention.</p><p>Configure goals, events, custom dimensions, and audiences. Use segments for granular analysis. Connect with Google Search Console for search performance data.</p>" },
          { title: "Conversion Rate Optimization", duration: 25, videoUrl: "https://www.youtube.com/watch?v=8Dq1X3Gz_iM", content: "<p>CRO improves the percentage of visitors who complete desired actions. Learn the CRO process: research, hypothesis, test, analyze, implement. Use heatmaps, session recordings, and user surveys.</p><p>A/B testing: statistical significance, sample size calculation, test duration, and multivariate testing. Common optimization areas: landing pages, forms, CTAs, checkout process.</p>" },
          { title: "Marketing Funnel & Attribution", duration: 25, videoUrl: "https://www.youtube.com/watch?v=8Dq1X3Gz_iM", content: "<p>Understand the marketing funnel: awareness, consideration, conversion, loyalty, advocacy. Map content and channels to each stage.</p><p>Attribution models: first-click, last-click, linear, time-decay, position-based, data-driven. Understand multi-touch attribution and how to allocate budget effectively across channels.</p>" },
          { title: "Growth Hacking Techniques", duration: 20, videoUrl: "https://www.youtube.com/watch?v=8Dq1X3Gz_iM", content: "<p>Growth hacking combines marketing, product, and data for rapid growth. Learn the AARRR pirate metrics framework: Acquisition, Activation, Retention, Revenue, Referral.</p><p>Growth loops vs funnels. Viral marketing mechanics, referral programs, freemium models, and product-led growth. Case studies of successful growth hacks from companies like Dropbox, Airbnb, and Slack.</p>" }
        ],
        quiz: {
          title: "Analytics & Optimization Quiz",
          passingScore: 70,
          questions: [
            { text: "What is Conversion Rate Optimization (CRO)?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Systematically improving the percentage of visitors who take desired actions", isCorrect: true }, { text: "Increasing website traffic", isCorrect: false }, { text: "Reducing ad spending", isCorrect: false }, { text: "Optimizing server response times", isCorrect: false }] },
            { text: "Which attribution model gives all credit to the last interaction before conversion?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Last-click attribution", isCorrect: true }, { text: "First-click attribution", isCorrect: false }, { text: "Linear attribution", isCorrect: false }, { text: "Time-decay attribution", isCorrect: false }] },
            { text: "What does the 'R' in AARRR stand for?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Revenue", isCorrect: true }, { text: "Research", isCorrect: false }, { text: "Retargeting", isCorrect: false }, { text: "Reporting", isCorrect: false }] }
          ]
        }
      }
    ]
  },
  {
    title: "Mathematics for Machine Learning",
    description: "Build the mathematical foundation for machine learning. Master linear algebra, calculus, probability, and statistics essential for understanding ML algorithms.",
    category: "Mathematics",
    isFree: true,
    modules: [
      {
        title: "Linear Algebra for ML",
        lessons: [
          { title: "Vectors & Vector Spaces", duration: 30, videoUrl: "https://www.youtube.com/watch?v=fNk_zzaMoSs", content: "<p>Vectors are fundamental to machine learning. Learn vector operations: addition, scalar multiplication, dot product, cross product, norm, and unit vectors. Understand linear combinations and span.</p><p>Vector spaces, subspaces, basis, and dimension. Linear independence and dependence. Applications in feature representation and word embeddings.</p>" },
          { title: "Matrices & Matrix Operations", duration: 35, videoUrl: "https://www.youtube.com/watch?v=fNk_zzaMoSs", content: "<p>Matrices represent linear transformations. Learn matrix multiplication, transpose, inverse, determinant, and trace. Understand matrix properties: symmetric, orthogonal, positive definite.</p><p>Systems of linear equations: Gaussian elimination, LU decomposition. Matrix factorization: QR decomposition, Cholesky decomposition, and Singular Value Decomposition (SVD).</p>" },
          { title: "Eigenvalues & Eigenvectors", duration: 30, videoUrl: "https://www.youtube.com/watch?v=fNk_zzaMoSs", content: "<p>Eigenvalues and eigenvectors are crucial for dimensionality reduction (PCA). Learn characteristic equation, computing eigenvalues and eigenvectors, and eigendecomposition.</p><p>Applications: principal component analysis, spectral clustering, PageRank algorithm, Markov chains, and stability analysis of dynamical systems.</p>" },
          { title: "SVD & Dimensionality Reduction", duration: 25, videoUrl: "https://www.youtube.com/watch?v=fNk_zzaMoSs", content: "<p>Singular Value Decomposition factorizes any matrix into U, Sigma, and V-transpose. Learn the relationship between SVD and eigendecomposition, truncated SVD for dimensionality reduction.</p><p>Applications: image compression, latent semantic analysis, recommendation systems, and noise reduction. SVD is the foundation of many ML algorithms.</p>" }
        ],
        quiz: {
          title: "Linear Algebra Quiz",
          passingScore: 70,
          questions: [
            { text: "What is the dot product of two orthogonal vectors?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Zero", isCorrect: true }, { text: "One", isCorrect: false }, { text: "The product of their magnitudes", isCorrect: false }, { text: "Undefined", isCorrect: false }] },
            { text: "What does SVD stand for?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Singular Value Decomposition", isCorrect: true }, { text: "Standard Variance Distribution", isCorrect: false }, { text: "Symmetric Vector Division", isCorrect: false }, { text: "Sequential Value Decay", isCorrect: false }] },
            { text: "What is an eigenvalue of a matrix?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "A scalar such that Av = λv for some nonzero vector v", isCorrect: true }, { text: "A vector that is mapped to zero by the matrix", isCorrect: false }, { text: "The determinant of the matrix", isCorrect: false }, { text: "The trace of the matrix", isCorrect: false }] },
            { text: "What is the rank of a matrix?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "The dimension of the vector space spanned by its columns", isCorrect: true }, { text: "The number of rows in the matrix", isCorrect: false }, { text: "The absolute value of its determinant", isCorrect: false }, { text: "The sum of its eigenvalues", isCorrect: false }] }
          ]
        }
      },
      {
        title: "Calculus & Probability",
        lessons: [
          { title: "Derivatives & Gradient Descent", duration: 30, videoUrl: "https://www.youtube.com/watch?v=WUvTyaaNkzM", content: "<p>Derivatives measure rate of change. Learn differentiation rules: power rule, product rule, chain rule, quotient rule. Partial derivatives for multivariate functions.</p><p>Gradient descent optimization: compute gradient, update parameters with learning rate. Learning rate scheduling, momentum, and adaptive methods like Adam. The gradient is the direction of steepest ascent.</p>" },
          { title: "Integrals & Probability Distributions", duration: 30, videoUrl: "https://www.youtube.com/watch?v=WUvTyaaNkzM", content: "<p>Integration computes area under curves. Definite and indefinite integrals, fundamental theorem of calculus. Common distributions: uniform, normal (Gaussian), Bernoulli, binomial, Poisson, exponential. Expected value and variance.</p>" },
          { title: "Bayes' Theorem & Conditional Probability", duration: 25, videoUrl: "https://www.youtube.com/watch?v=WUvTyaaNkzM", content: "<p>Conditional probability measures probability of an event given another. Learn joint probability, marginal probability, and independence. Bayes' theorem updates beliefs with evidence: P(A|B) = P(B|A) * P(A) / P(B).</p><p>Applications: Naive Bayes classifier, Bayesian inference, spam filtering, medical diagnosis. Understand prior, likelihood, evidence, and posterior.</p>" },
          { title: "Information Theory & Entropy", duration: 25, videoUrl: "https://www.youtube.com/watch?v=WUvTyaaNkzM", content: "<p>Information theory quantifies information content. Learn entropy (average information content), cross-entropy (difference between distributions), and KL divergence (relative entropy).</p><p>Applications: decision tree splitting criteria, loss functions for classification, mutual information for feature selection, and model evaluation metrics.</p>" }
        ],
        quiz: {
          title: "Calculus & Probability Quiz",
          passingScore: 70,
          questions: [
            { text: "What does the gradient of a function represent?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "The direction of steepest ascent", isCorrect: true }, { text: "The minimum value of the function", isCorrect: false }, { text: "The area under the curve", isCorrect: false }, { text: "The average rate of change", isCorrect: false }] },
            { text: "What is Bayes' theorem used for?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Updating probability estimates based on new evidence", isCorrect: true }, { text: "Computing derivatives of complex functions", isCorrect: false }, { text: "Solving systems of linear equations", isCorrect: false }, { text: "Finding eigenvalues of a matrix", isCorrect: false }] },
            { text: "What does entropy measure in information theory?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "The average amount of information or uncertainty in a random variable", isCorrect: true }, { text: "The maximum value of a probability distribution", isCorrect: false }, { text: "The variance of a dataset", isCorrect: false }, { text: "The correlation between two variables", isCorrect: false }] },
            { text: "What is the chain rule used for in calculus?", type: "MULTIPLE_CHOICE", points: 1, options: [{ text: "Computing derivatives of composite functions", isCorrect: true }, { text: "Integrating products of functions", isCorrect: false }, { text: "Finding limits of sequences", isCorrect: false }, { text: "Solving differential equations", isCorrect: false }] }
          ]
        }
      }
    ]
  }
]

async function ensureCategories() {
  const allCats = [...new Set(COURSES.map(c => c.category))]
  console.log(`Ensuring ${allCats.length} categories exist...`)
  const map = {}
  for (const name of allCats) {
    const slug = slugify(name)
    const { data, error } = await admin.from("categories").upsert({ name, slug, description: `${name} courses` }).select("id").single()
    if (error) { console.error(`Error upserting category "${name}":`, error); throw error }
    map[name] = data.id
    console.log(`  Category "${name}" -> ${data.id}`)
  }
  return map
}

async function main() {
  console.log("Starting course seed...")
  const catMap = await ensureCategories()

  const instructorEmail = "instructor@example.com"
  let instructorId
  const { data: existingUser } = await admin.from("users").select("id").eq("email", instructorEmail).single()
  if (existingUser) {
    instructorId = existingUser.id
    console.log(`Using existing instructor: ${instructorEmail} (${instructorId})`)
  } else {
    const { data: newUser, error: createError } = await admin.from("users").insert({ email: instructorEmail, role: "INSTRUCTOR", name: "Demo Instructor" }).select("id").single()
    if (createError) { console.error("Error creating instructor:", createError); throw createError }
    instructorId = newUser.id
    console.log(`Created instructor: ${instructorEmail} (${instructorId})`)
  }

  for (const course of COURSES) {
    const courseSlug = slugify(course.title)
    console.log(`\nCreating course: ${course.title}`)

    const { data: courseData, error: courseError } = await admin.from("courses").insert({
      title: course.title,
      slug: courseSlug,
      description: course.description,
      instructor_id: instructorId,
      category_id: catMap[course.category],
      is_free: course.isFree,
      status: "PUBLISHED"
    }).select("id").single()
    if (courseError) { console.error(`Error creating course "${course.title}":`, courseError); throw courseError }
    const courseId = courseData.id
    console.log(`  Course ID: ${courseId}`)

    for (let mi = 0; mi < course.modules.length; mi++) {
      const mod = course.modules[mi]
      console.log(`  Module ${mi + 1}: ${mod.title}`)

      const { data: modData, error: modError } = await admin.from("modules").insert({
        course_id: courseId,
        title: mod.title,
        order: mi + 1
      }).select("id").single()
      if (modError) { console.error(`Error creating module:`, modError); throw modError }
      const modId = modData.id

      for (let li = 0; li < mod.lessons.length; li++) {
        const lesson = mod.lessons[li]
        const { data: lessonData, error: lessonError } = await admin.from("lessons").insert({
          module_id: modId,
          title: lesson.title,
          duration: lesson.duration,
          video_url: lesson.videoUrl,
          content: lesson.content,
          order: li + 1
        }).select("id").single()
        if (lessonError) { console.error(`Error creating lesson:`, lessonError); throw lessonError }
      }

      if (mod.quiz) {
        const { data: quizData, error: quizError } = await admin.from("quizzes").insert({
          module_id: modId,
          title: mod.quiz.title,
          passing_score: mod.quiz.passingScore
        }).select("id").single()
        if (quizError) { console.error(`Error creating quiz:`, quizError); throw quizError }
        const quizId = quizData.id

        for (const question of mod.quiz.questions) {
          const { data: qData, error: qError } = await admin.from("quiz_questions").insert({
            quiz_id: quizId,
            text: question.text,
            type: question.type,
            points: question.points
          }).select("id").single()
          if (qError) { console.error(`Error creating question:`, qError); throw qError }
          const qId = qData.id

          for (const option of question.options) {
            const { error: optError } = await admin.from("quiz_options").insert({
              question_id: qId,
              text: option.text,
              is_correct: option.isCorrect
            })
            if (optError) { console.error(`Error creating option:`, optError); throw optError }
          }
        }
      }
    }
  }

  console.log("\nSeed complete! All courses inserted successfully.")
}

main().catch(console.error)
