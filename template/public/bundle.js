// deno:https://jsr.io/@html-props/core/0.5.0/ref.ts
function createRef(defaultValue = void 0) {
  return {
    current: defaultValue
  };
}

// deno:https://jsr.io/@html-props/core/0.5.0/mod.ts
function insertContent(element, content) {
  const isHTML = (string) => {
    const doc = new DOMParser().parseFromString(string, "text/html");
    return Array.from(doc.body.childNodes).some((node) => node.nodeType === 1);
  };
  const createFragmentFromHTML = (html) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    const fragment = document.createDocumentFragment();
    Array.from(tempDiv.childNodes).forEach((node) => fragment.appendChild(node));
    return fragment;
  };
  const convertContent = (contentItem) => {
    if (contentItem instanceof Node) {
      return contentItem;
    }
    if (typeof contentItem === "string") {
      return contentItem;
    }
    if (Array.isArray(contentItem)) {
      const fragment = document.createDocumentFragment();
      contentItem.forEach((item) => {
        const child2 = convertContent(item);
        if (typeof child2 === "string") {
          fragment.appendChild(createFragmentFromHTML(child2));
        } else {
          fragment.appendChild(child2);
        }
      });
      return fragment;
    }
    return "";
  };
  const child = convertContent(content);
  if (typeof child === "string" && isHTML(child)) {
    element.innerHTML = child;
  } else if (child instanceof DocumentFragment || child instanceof Node) {
    element.replaceChildren(child);
  }
}
var HTMLPropsMixin = (superClass) => {
  class HTMLPropsMixinClass extends superClass {
    props;
    ref;
    content;
    constructor(...rest) {
      super();
      this.props = rest[0] ?? {};
    }
    connectedCallback() {
      if (super.connectedCallback) {
        super.connectedCallback();
      }
      const constructor = this.constructor;
      if (!customElements.get(this.localName)) {
        const name = customElements.getName(constructor);
        if (name) {
          this.setAttribute("is", name);
        }
      }
      if (constructor.observedProperties) {
        for (const propertyName of constructor.observedProperties) {
          if (propertyName in this) {
            let property = this[propertyName];
            const getter = () => property;
            const setter = (newValue) => {
              const oldValue = property;
              property = newValue;
              this.propertyChangedCallback?.(propertyName, oldValue, newValue);
            };
            Object.defineProperty(this, propertyName, {
              get: getter,
              set: setter,
              enumerable: true,
              configurable: true
            });
          }
        }
      }
      const merge = (...objects) => {
        const isTruthy = (item) => !!item;
        const prepped = objects.filter(isTruthy);
        if (prepped.length === 0) {
          return;
        }
        return prepped.reduce((result, current) => {
          Object.entries(current).forEach(([key, value]) => {
            if (typeof value === "object") {
              result[key] = merge(result[key], current[key]);
            } else {
              result[key] = current[key];
            }
          });
          return result;
        });
      };
      const { ref, style, dataset, ...rest } = merge(this.getDefaultProps(), this.props);
      this.ref = ref;
      if (this.ref) {
        this.ref.current = this;
      }
      if (style) {
        Object.assign(this.style, style);
      }
      if (dataset) {
        Object.assign(this.dataset, dataset);
      }
      Object.assign(this, rest);
      const hasRenderMethod = "render" in this;
      if (!hasRenderMethod && this.content) {
        insertContent(this, this.content);
      }
    }
    /**
     * Returns the default properties for the component.
     * This method can be overridden by subclasses to provide default values for properties.
     *
     * @returns {this['props']} An object containing the default properties.
     */
    getDefaultProps() {
      return {};
    }
  }
  return HTMLPropsMixinClass;
};
var HTMLTemplateMixin = (superClass) => {
  class HTMLTemplateMixinClass extends superClass {
    connectedCallback() {
      if (super.connectedCallback) {
        super.connectedCallback();
      }
      this.build();
    }
    /**
     * Builds the component by rendering its content based on the output of the `render` method.
     *
     * The `build` method processes the result of the `render` method, which can be a Node, a string,
     * an array of Nodes, or null/undefined. It then updates the component's children accordingly.
     *
     * @throws {Error} If the render result is of an invalid type.
     */
    build() {
      if (this.render) {
        const render = this.render();
        insertContent(this, render);
      }
    }
  }
  return HTMLTemplateMixinClass;
};
var HTMLUtilityMixin = (superClass) => {
  class HTMLUtilityMixinClass extends superClass {
    /**
     * Defines a custom element with the specified name and options.
     *
     * @param name - The name of the custom element to define.
     * @param options - Optional configuration options for the custom element.
     * @returns The class itself, allowing for method chaining.
     */
    static define(name, options) {
      customElements.define(name, this, options);
      return this;
    }
    /**
     * Retrieves the name of the custom element.
     *
     * @returns The name of the custom element as a string, or null if the element is not defined.
     */
    static getName() {
      return customElements.getName(this);
    }
    /**
     * Generates a selector string for the custom element.
     *
     * @param selectors - Additional selectors to append to the element's selector.
     * @returns The complete selector string for the custom element.
     */
    static getSelectors(selectors = "") {
      const name = this.getName();
      const localName = new this().localName;
      if (name !== localName) {
        return `${localName}[is="${name}"]${selectors}`;
      }
      return `${name}${selectors}`;
    }
  }
  return HTMLUtilityMixinClass;
};
var HTMLAllMixin = (superClass) => {
  return HTMLUtilityMixin(HTMLTemplateMixin(HTMLPropsMixin(superClass)));
};
var mod_default = HTMLAllMixin;

// src/html.ts
var Div = mod_default(HTMLDivElement).define("html-div", {
  extends: "div"
});
var Anchor = mod_default(HTMLAnchorElement).define("html-a", {
  extends: "a"
});
var Image = mod_default(HTMLImageElement).define("html-img", {
  extends: "img"
});
var Heading1 = mod_default(HTMLHeadingElement).define("html-h1", {
  extends: "h1"
});
var Button = mod_default(HTMLButtonElement).define("html-button", {
  extends: "button"
});
var Paragraph = mod_default(HTMLParagraphElement).define("html-p", {
  extends: "p"
});
var Code = mod_default(HTMLElement).define("html-code", {
  extends: "code"
});

// src/App.ts
var App = class extends mod_default(HTMLElement) {
  static get observedProperties() {
    return [
      "count"
    ];
  }
  count = 0;
  buttonRef = createRef();
  propertyChangedCallback(name, oldValue, newValue) {
    if (name === "count" && oldValue !== newValue) {
      const button = this.buttonRef.current;
      if (button) {
        button.textContent = `count is ${newValue}`;
      }
    }
  }
  render() {
    return new Div({
      content: [
        new Anchor({
          href: "https://vite.dev",
          target: "_blank",
          content: new Image({
            src: "/vite.svg",
            alt: "Vite logo",
            className: "logo"
          })
        }),
        new Anchor({
          href: "https://react.dev",
          target: "_blank",
          content: new Image({
            src: "/react.svg",
            alt: "React logo",
            className: "logo react"
          })
        }),
        new Heading1({
          content: "Vite + React"
        }),
        new Div({
          className: "card",
          content: [
            new Button({
              ref: this.buttonRef,
              onclick: () => {
                this.count++;
              },
              textContent: `count is ${this.count}`
            }),
            new Paragraph({
              content: [
                "Edit ",
                new Code({
                  textContent: "src/App.ts"
                }),
                " and save to test bundling"
              ]
            })
          ]
        }),
        new Paragraph({
          class: "read-the-docs",
          content: "Click on the Vite and React logos to learn more"
        })
      ]
    });
  }
};
App.define("my-app");

// src/main.ts
document.getElementById("root").appendChild(new App());
