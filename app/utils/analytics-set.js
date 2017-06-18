export default function(key, value) {
    if (window.ga) {
        window.ga('set', key, value);
    }
}
