export const registerComponent = (componentClass) => {
  const componentName = `my-${componentClass.name.toLowerCase()}`;
  customElements.define(componentName, componentClass);
};
