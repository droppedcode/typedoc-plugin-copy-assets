# Module 1

This is kind of module exported as namespace from main module

Also image (won't be included because of extension filter):

![module1](./module1.jpg)

## Html img tag

Paths will be replaced even in code blocks.

```html
<img data-foo="bar" src="./html-image1.png" alt="Html image" />
<img data-foo="bar" src="/html-image2.png" alt="Html image" />
<img data-foo="bar" src="html-image3.png" alt="Html image" />
<img data-foo="bar" src="html/html-image4.png" alt="Html image" />
```

This is not really recommended, but works:

<img data-foo="bar" src="./html-image1.png" alt="Html image" />
<img data-foo="bar" src="/html-image2.png" alt="Html image" />
<img data-foo="bar" src="html-image3.png" alt="Html image" />
<img data-foo="bar" src="html/html-image4.png" alt="Html image" />

You can exclude items with regex:

```html
<img data-foo="do not" src="./html-image1.png" alt="Html image" />
```
