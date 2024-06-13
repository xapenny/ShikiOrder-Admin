export const getOrderState = (state: number) => {
    switch (state) {
        case 0:
            return '待付款';
        case 1:
            return '已取消';
        case 2:
            return '备餐中';
        case 3:
            return '请取餐';
        case 4:
            return '已完成';
        default:
            return '未知状态';
    }
}