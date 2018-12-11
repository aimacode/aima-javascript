function main() {
    banner();
    game();
    gameTree();
    parallax1();
    recurive();
    bigtree();
    transition();
    parallax2();
    alphabeta();
    badtree();
    deepening();
    comparison();

    function position_tracker(e) {
        document.dispatchEvent(new Event('parallax1event'));
    }
    document.onscroll = position_tracker;
    window.onresize = position_tracker;
    position_tracker();
}