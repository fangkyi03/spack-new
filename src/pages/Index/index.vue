<script>
export default {
  data() {
    return {
      inputValue: "",
    };
  },
  methods: {
    renderInput() {
      return <input value={this.inputValue} />;
    },
  },
  render() {
    return (
      <div>
        <van-button>测试</van-button>
        <van-cell-group>
          <van-cell title="单元格111" value={'ceasa'}>
          </van-cell>
          <van-cell title="单元格" value="内容" label="描述信息" />
        </van-cell-group>
      </div>
    );
  },
};
</script>
