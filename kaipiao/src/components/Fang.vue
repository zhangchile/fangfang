<template>
    <div class="">
        <el-row type="flex" class="row-bg" justify="center">
        <el-col :span="20">
        <el-table
            :data="tableData"
            show-summary
 
            style="width: 100%">
            <el-table-column
            label="数量"
            width="180">
                <template slot-scope="scope">
                    <el-input v-on:change="changeParam" v-model="scope.row.num"></el-input>
                </template>
            </el-table-column>
            <el-table-column
            label="单价"
            width="180">
                <template slot-scope="scope">
                    <el-input v-on:change="changeParam" v-model="scope.row.price"></el-input>
                </template>
            </el-table-column>
            <el-table-column
            prop="sum"
            label="总额"
            width="180">
            </el-table-column>
            <el-table-column
            prop="needsum"
            label="本次开票数量"
            width="180">
                <template slot-scope="scope">
                    <el-input :disabled="scope.row.lock" v-on:change="changeParam" v-model="scope.row.needsum">
                    <el-checkbox slot="append" label="锁定" name="type" v-model="scope.row.lock"></el-checkbox>
                    </el-input>
                </template>

            </el-table-column>
            <el-table-column
            prop="needprice"
            label="本次开票金额"
            width="180">
            </el-table-column>
            <el-table-column
            label=""
            width="">
                <template slot-scope="scope">
                    <el-button size="mini" @click="delRow(scope.$index)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <p></p>
        <el-alert
            v-if="fail"
            :closable="false"
            title="计算失败，尝试用小数试试吧"
            type="error">
        </el-alert>
        <p></p>
        </el-col>
        </el-row>
        <el-row type="flex" class="row-bg" justify="center">
            <el-col :span="14">
                <el-form :inline="true" :model="kaipiao">
                <el-form-item label="开票额">
                    <el-input v-model="kaipiao.sum" placeholder="数额或百分比(如20%)">
                        <template v-if="kaipiaoSum" slot="append">{{kaipiaoSum}}</template>
                    </el-input>
                </el-form-item>
                <el-form-item label="允许小数个数">
                    <el-input type="number" v-model="kaipiao.floatnum"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="calNum" :loading="loading">计算</el-button>
                </el-form-item>
                </el-form>

            </el-col>
        </el-row>
        <span style="font-size:10px;">create by 阿智 with ❤</span>
    </div>
</template>

<script>
/* eslint-disable */
export default {
    name: 'fang',
    data() {
        return {
            kaipiao: {
                sum:'',
                precent:0,
                floatnum:0
            },
            tableData: [
                {
                    num: 0,
                    price: 0,
                    sum: 0,
                    needsum:0,
                    needprice:0,
                },
                {
                    num: 0,
                    price: 0,
                    sum: 0,
                    needsum:0,
                    needprice:0,
                },
                {
                    num: 0,
                    price: 0,
                    sum: 0,
                    needsum:0,
                    needprice:0,
                }
            //     {
            //     num: 1,
            //     price: 5000000,
            //     sum: 0,
            //     needsum:0,
            //     needprice:0,
            // }, {
            //     num: 1,
            //     price: 350000,
            //     sum: 0,
            //     needsum:0,
            //     needprice:0,
            // },
            //  {
            //     num: 27,
            //     price: 43000,
            //     sum: 0,
            //     needsum:0,
            //     needprice:0,
            // }, {
            //     num: 170,
            //     price: 7590,
            //     sum: 0,
            //     needsum:0,
            //     needprice:0,
            // }, {
            //     num: 80,
            //     price: 11800,
            //     sum: 0,
            //     needsum:0,
            //     needprice:0,
            // }
            ],
            totalPrice: 0,
            fail: false,
            loading: false,
            proStep: 0,
        }
    },
    methods: {
        _shuffle: function(arr) {
            for (var j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
            return arr;
        },

        changeParam: function () {
            var flag = false;
            var original = this.tableData;
            this.totalPrice = 0;
            var that = this
            original.forEach(function (val, index) {
                if (val.num < val.needsum) {
                    val.needsum = val.num;
                }
                val.sum = val.num*val.price;
                val.needprice = val.needsum*val.price;
                that.totalPrice += val.sum;
                
                return val;
            });
            if (original[original.length - 1].num > 0 || original[original.length - 1].price > 0) {
                original.push({
                    num: 0,
                    price: 0,
                    sum: 0,
                    needsum:0,
                    needprice:0,
                })
            }
            this.tableData = original;
        },
        delRow: function (index) {
            this.changeParam();
            this.tableData.splice(index, 1);
        },
        calNum: function () {
            this.fail = false;
            var target = this.kaipiao.sum;
            if (target == 0) {
                return;
            }
            // 判断是百分号还是数额
            if (target.substr(-1,1) == "%") {
                // 百分号
                target = parseFloat(target.substr(0, target.length-1)) / 100 * this.totalPrice;
            } else {
                target = parseFloat(target).toFixed(this.kaipiao.floatnum);
            }
            var that = this;
            var res_arr = [];
            var sumVal = 0;
            var tryTime = 9999999;
            var fail = false;
            this.loading = true;
            // 穷举法
            var unit = 1;
            if (this.kaipiao.floatnum > 0) {
                unit = unit / Math.pow(10, this.kaipiao.floatnum);
            }
            console.log(unit)
            var all = []; // 每一行所有的总数数组
            var allLen = []; // 每一行的长度
            var totalStep = 1;

            this.tableData.forEach(function (item, index){
                var group = [];
                if (item.lock) {
                    group.push(item.needsum*item.price);
                } else {
                    for (var i = 0; i <= item.num; i+=unit) {
                        if (item.sum > 0) {
                            group.push((i*item.price).toFixed(that.kaipiao.floatnum));
                        }
                    }
                }
                if (group.length) {
                    // 乱序数组
                    all.push(that._shuffle(group));
                    allLen.push(group.length);
                    totalStep *= group.length;
                }
            });
console.log(target)
console.log(all)
            var resetLen = function (len, index) {
                if (len[index] == 1 && index > 0) {
                    if (len[index-1]==1) {
                        return false;
                    }
                    len[index-1]--;
                    len[index] = all[index].length; // 恢复
                    return resetLen(len, index-1);
                } else {
                    if (len[len.length - 1] == 1) { // 最后的那一位
                        return false;
                    } else {
                        return len;
                    }
                }

            };
            var currStep = 1;
            setTimeout(function () {
                do {
                    if (allLen == false) {
                        fail = true;
                        break;
                    }

                    res_arr = [];
                    sumVal = 0;
                    all.forEach(function (item, index) {
                        sumVal += parseFloat(item[allLen[index] - 1]);
                        res_arr.push(item[allLen[index] - 1]);
                    });
                    if (allLen[allLen.length - 1] > 1) {
                        allLen[allLen.length - 1]--;
                    } else {
                        allLen = resetLen(allLen, allLen.length - 1);
                    }
                    // if (0 >= tryTime--) {
                    //     fail = true;
                    //     break;
                    // }
                } while (sumVal != target);

                console.log('sumval='+sumVal)
                that.loading = false;
                if (fail) {
                    that.fail = true;
                } else {

                    that.fail = false;
                    res_arr.forEach(function (item, index) {
                        that.tableData[index].needsum = item / that.tableData[index].price;
                        that.tableData[index].needprice = item;
                    })
                }
            },0);
        }
    },
    computed: {
        kaipiaoSum: function () {
            var target = this.kaipiao.sum;
            // 判断是百分号还是数额
            if (target.substr(-1,1) == "%") {
                // 百分号
                return parseFloat(target.substr(0, target.length-1)) / 100 * this.totalPrice;
            }
            
        }
    },
    watch: {
        proStep: function(nv) {
            console.log(nv)
        }
    }
}
</script>

