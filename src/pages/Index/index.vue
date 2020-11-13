<script>
export default {
    data() {
        return {
            inputValue:''
        }
    },
    mounted() {
        vant.Notify('测试')
    },
    methods: {
        renderInput() {
            return (
                <input value={this.inputValue}/>
            )
        }
    },
    render(h) {
        return (
            <div>
                <van-search v-model="value" placeholder="请输入搜索关键词" />
                <van-button>ceshi</van-button>
                <div onClick={()=>this.inputValue = Math.random()}>点击给编辑框赋值</div>
                {this.renderInput()}
            </div>
        )
    },
}
</script>
