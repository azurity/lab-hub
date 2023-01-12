function open_lab_item(e) {
    e.cancelBubble = true;
    // console.log("open_lab_item");
    let aim = e.currentTarget.dataset['aim'];
    document.getElementById('main').src = aim;
    return true;
}

function open_in_new(e) {
    e.cancelBubble = true;
    // console.log("open_in_new");
    let aim = e.currentTarget.parentNode.dataset['aim'];
    window.open(aim, '_blank');
    return true;
}
