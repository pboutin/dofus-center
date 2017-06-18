export default function(category, action, label, value) {
    if (window.ga) {
        window.ga('send', 'event', category, action, label, value || null);
    }
}
