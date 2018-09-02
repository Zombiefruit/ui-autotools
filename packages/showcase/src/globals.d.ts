type RuntimeStylesheet = import('@stylable/runtime').RuntimeStylesheet;

declare module '*.st.css' {
    const stylesheet: RuntimeStylesheet;
    export default stylesheet;
}