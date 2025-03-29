class Watermarker {
    constructor() {
        this.canvas = document.getElementById('previewCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupEventListeners();
        this.image = null;
        
        // 设置默认日期为今天
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        document.getElementById('dateInput').value = `${year}-${month}-${day}`;
        
        // 优化移动端时间日期输入
        this.setupDateTimeInputs();
    }

    setupEventListeners() {
        // 文件选择按钮
        document.getElementById('selectButton').addEventListener('click', () => {
            document.getElementById('imageInput').click();
        });

        // 文件输入变化
        document.getElementById('imageInput').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                document.getElementById('fileName').textContent = file.name;
                this.loadImage(file);
            }
        });

        // 添加水印按钮
        document.getElementById('addWatermark').addEventListener('click', () => {
            if (!this.image) {
                alert('请先选择图片！');
                return;
            }
            this.addWatermark();
        });
    }

    setupDateTimeInputs() {
        const timeInput = document.getElementById('timeInput');
        const dateInput = document.getElementById('dateInput');

        // 检测是否为移动设备
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        if (isMobile) {
            // 时间输入优化
            timeInput.addEventListener('touchstart', (e) => {
                e.target.focus();
            });

            // 日期输入优化
            dateInput.addEventListener('touchstart', (e) => {
                e.target.focus();
            });

            // 添加输入完成时的视觉反馈
            [timeInput, dateInput].forEach(input => {
                input.addEventListener('change', () => {
                    input.blur();
                });
            });
        }
    }

    loadImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            this.image = new Image();
            this.image.onload = () => {
                this.canvas.width = this.image.width;
                this.canvas.height = this.image.height;
                this.ctx.drawImage(this.image, 0, 0);
                
                this.originalWidth = this.image.width;
                this.originalHeight = this.image.height;
            };
            this.image.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    addWatermark() {
        // 清除画布并重新绘制原图
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.image, 0, 0);

        const timeStr = document.getElementById('timeInput').value || this.getCurrentTime();
        const dateStr = document.getElementById('dateInput').value || this.getCurrentDate();
        const watermarkText = document.getElementById('textInput').value;
        const weekdayStr = this.getWeekday(dateStr);

        // 使用原始图片宽度计算比例
        const scaleFactor = Math.max(this.originalWidth / 1000, 0.5);
        
        // 设置字体样式
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        
        // 基础字体大小
        const baseTimeFontSize = 80;
        const baseNormalFontSize = 32;
        
        // 计算实际字体大小
        const timeFontSize = Math.round(baseTimeFontSize * scaleFactor);
        const normalFontSize = Math.round(baseNormalFontSize * scaleFactor);
        
        // 计算基础边距
        const baseBottomMargin = 60;
        const baseLeftMargin = 50;
        const baseLineWidth = 8;
        
        // 计算实际边距
        const bottomMargin = baseBottomMargin * scaleFactor;
        const leftMargin = baseLeftMargin * scaleFactor;
        
        // 计算水印位置和大小
        const padding = Math.round(this.canvas.width * 0.05); // 边距
        const lineHeight = Math.round(this.canvas.height * 0.15); // 黄线高度
        const fontSize = Math.round(this.canvas.width * 0.15); // 时间字体大小
        const smallFontSize = Math.round(fontSize * 0.3); // 小字体大小

        // 设置绘制位置
        const x = padding;
        const y = this.canvas.height - padding - lineHeight;
        
        // 绘制时间
        this.ctx.font = `${timeFontSize}px Microsoft YaHei`;
        const timeWidth = this.ctx.measureText(timeStr).width;
        this.ctx.fillText(timeStr, leftMargin, this.canvas.height - bottomMargin);

        // 绘制黄色分割线
        this.ctx.beginPath();
        this.ctx.strokeStyle = '#F3CB41';
        this.ctx.lineWidth = baseLineWidth * scaleFactor;
        const lineX = leftMargin + timeWidth + (15 * scaleFactor);
        const lineStartY = this.canvas.height - bottomMargin - (70 * scaleFactor);
        const lineEndY = this.canvas.height - bottomMargin + (10 * scaleFactor);
        this.ctx.moveTo(lineX, lineStartY);
        this.ctx.lineTo(lineX, lineEndY);
        this.ctx.stroke();

        // 绘制日期和星期
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.font = `${normalFontSize}px Microsoft YaHei`;
        const dateX = lineX + (20 * scaleFactor);
        
        // 调整日期位置，与黄线上端对齐
        this.ctx.fillText(dateStr.replace(/-/g, '.'), dateX, lineStartY + normalFontSize);
        
        // 调整星期位置，与黄线下端对齐
        this.ctx.fillText(weekdayStr, dateX, lineEndY - 5);

        // 绘制自定义文字
        if (watermarkText) {
            const textWidth = this.ctx.measureText(watermarkText).width;
            this.ctx.fillText(watermarkText, 
                this.canvas.width - textWidth - (50 * scaleFactor), 
                this.canvas.height - bottomMargin);
        }

        // 更新下载链接
        const downloadLink = document.getElementById('downloadLink');
        downloadLink.href = this.canvas.toDataURL('image/png');
        downloadLink.style.display = 'block';
        downloadLink.classList.add('show');
    }

    getCurrentTime() {
        const now = new Date();
        return now.getHours().toString().padStart(2, '0') + ':' + 
               now.getMinutes().toString().padStart(2, '0');
    }

    getCurrentDate() {
        const now = new Date();
        return now.getFullYear() + '.' + 
               (now.getMonth() + 1).toString().padStart(2, '0') + '.' + 
               now.getDate().toString().padStart(2, '0');
    }

    getWeekday(dateStr) {
        const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        const date = new Date(dateStr);
        return weekdays[date.getDay()];
    }

    // 辅助方法：格式化日期
    formatDate(dateString) {
        const date = new Date(dateString);
        return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    }
}

// 初始化水印工具
window.addEventListener('DOMContentLoaded', () => {
    new Watermarker();
}); 