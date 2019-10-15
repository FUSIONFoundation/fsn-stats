import React from 'react';
import {
    Card,
    Row,
    Col,
    Container,
    Badge,
    Button,
    Nav,
    ProgressBar,
    Navbar,
    NavbarBrand,
    NavDropdown,
    Table,
    Form,
    FormControl
} from 'react-bootstrap'
import Fade from 'react-reveal/Fade';
import CountUp from 'react-countup';
import Skeleton, {SkeletonTheme} from 'react-loading-skeleton';
import TimeAgo from 'react-timeago'
import Spinner from './Spinner';
import {
    BarChart,
    ComposedChart,
    ChartTooltip,
    ResponsiveContainer,
    Line,
    Bar,
    Tooltip,
    YAxis,
    Legend,
    XAxis,
    CartesianGrid
} from 'recharts';
import FontAwesome from 'react-loading-skeleton';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

let W3CWebSocket = require('websocket').w3cwebsocket;


class Main extends React.Component {
    constructor(props) {
        super(props);

        let allNodes = [];
        let identifiers = [];

        const keepAlive = () => {
            let client = new W3CWebSocket('wss://node.fusionnetwork.io/primus');

            client.onmessage = (data) => {
                let action = JSON.parse(data.data).action;
                // console.log(action);
                if (action === 'charts') {
                    let chartData = JSON.parse(data.data).data;
                    let highestBlock = Math.max(...chartData.height);
                    let heightChart = chartData.height;
                    let avgBlockTime = chartData.avgBlocktime.toString().substr(0, 5);
                    let difficulty = Math.max(...chartData.difficulty);

                    let blocksChart = [];

                    for (let i in chartData.blocktime) {
                        blocksChart[i] = {
                            "blocktime": chartData.blocktime[i],
                            "height": chartData.height[i]
                        };
                    }

                    this.setState({
                        highestBlock: highestBlock,
                        chartData: heightChart,
                        avgBlockTime: avgBlockTime,
                        difficulty: difficulty,
                        avgBlockTimeChart: blocksChart
                    });
                }

                if (action === 'stats') {
                    let id = JSON.parse(data.data).data.id;
                    let stats = JSON.parse(data.data).data.stats;
                    stats.id = id;

                    // if (allNodes.length > 5) return;

                    let objIndex = allNodes.findIndex((value => value.id === id));
                    if (objIndex === -1) {
                        allNodes.push(stats);
                        objIndex = allNodes.findIndex((value => value.id === id));
                        identifiers[objIndex] = id;
                    } else {
                        objIndex = allNodes.findIndex((value => value.id === id));
                        identifiers[objIndex] = id;
                    }
                    this.setState({
                        totalNodes: Object.keys(allNodes).length,
                        nodeIdentifiers: identifiers,
                        nodesList: allNodes
                    });
                }
                if (action === 'block') {
                    let blockData = JSON.parse(data.data).data;
                    let objIndex = allNodes.findIndex((value => value.id === blockData.id));
                    if (objIndex === -1) {

                    } else {
                        let propagationChart = [];
                        for (let i in blockData.history) {
                            propagationChart[i] = {
                                "id": i,
                                "value": blockData.history[i]
                            };
                        }

                        allNodes[objIndex].height = blockData.block.number;
                        allNodes[objIndex].propagationChart = propagationChart;
                        allNodes[objIndex].hash = formatHash(blockData.block.hash);
                        allNodes[objIndex].blockLastUpdated = (blockData.block.timestamp * 1000);
                        console.log(allNodes);
                        this.setState({
                            nodesList: allNodes
                        })
                        this.forceUpdate()
                    }
                }
                if (action === 'update') {
                    let info = JSON.parse(data.data);
                    console.log(info);
                }
                if (action === 'init') {

                }
                if (action === 'info') {
                    let info = JSON.parse(data.data);
                    console.log(info);
                }
            }

            client.onclose = () => {
                console.log('closed...');
                keepAlive();
            }

            const formatHash = (hash) => {
                let a = hash.length;
                let b = hash.substr(0, 4);
                let c = b + ' ... ' + hash.substr(a - 4, a);
                return c;
            }
        }

        keepAlive();
    }

    state = {
        highestBlock: undefined,
        chartData: {},
        avgBlockTime: 0,
        difficulty: 0,
        nodesList: [],
        nodeIdentifiers: [],
        totalNodes: undefined,
        avgBlockTimeChart: []
    }

    render() {

        let pinnedNodes = JSON.parse(localStorage.getItem('pinnedNodes'));
        const setPinnedNode = (nodename) => {
            let data = JSON.parse(localStorage.getItem('pinnedNodes'));
            let u = [];
            if (!Array.isArray(data)) {
                u.push(nodename);
                localStorage.setItem('pinnedNodes', JSON.stringify(u));
            } else {
                let data = JSON.parse(localStorage.getItem('pinnedNodes'));
                data.push(nodename);
                localStorage.setItem('pinnedNodes', JSON.stringify(data));
            }
            console.log(localStorage.getItem('pinnedNodes'))
        }

        const latencyClass = (latency) =>{
            if(latency > 100){
                return 'text-danger';
            }
            if(latency > 70){
                return 'text-warning';
            } else {
                return 'text-success'
            }
        }

        const RoundedBar = (props) => {
            const {fill, x, y, height} = props;

            return (
                <g>
                    <rect id="Rectangle-3" x={x} y={y} width="3" height={height} fill={fill} rx="1"/>
                    <rect id="Rectangle-3" x={x - 1} y="0" width="4" height="80" fill={fill} fillOpacity="0" rx="1"/>
                </g>
            );
        };
        return <body className={'bg-dark'}>
        <div className={'main-content'}>
            <SkeletonTheme color="#202020" highlightColor="#444">
                <Container fluid={true}>
                    <Row>
                        <Col md={12}>
                            <div className="alert alert-primary mt-2">
                                Work in progress!
                            </div>
                        </Col>
                        <Col md={3}>
                            <div className="card">
                                <div className="card-header">
                                    <div className="row align-items-center">
                                        <div className="col">
                                            <h4 className="card-header-title">
                                                Blocks
                                            </h4>
                                        </div>
                                        <div className="col-auto">
                                            {this.state.highestBlock || <Spinner/>}
                                        </div>
                                    </div>
                                </div>
                                <div className="card-body">
                                    {this.state.highestBlock}
                                </div>
                            </div>
                        </Col>
                        <Col md={3}>
                            <div className="card">
                                <div className="card-header">
                                    <div className="row align-items-center">
                                        <div className="col">
                                            <h4 className="card-header-title">
                                                Blocks
                                            </h4>
                                        </div>
                                        <div className="col-auto">
                                            {this.state.highestBlock || <Spinner/>}
                                        </div>
                                    </div>
                                </div>
                                <div className="card-body">
                                    {this.state.highestBlock}
                                </div>
                            </div>
                        </Col>
                        <Col md={3}>
                            <div className="card">
                                <div className="card-header">
                                    <div className="row align-items-center">
                                        <div className="col">
                                            <h4 className="card-header-title">
                                                Average Block Time
                                            </h4>
                                        </div>
                                        <div className="col-auto">
                                            {this.state.avgBlockTime ||
                                            <div className="spinner-border spinner-border-sm" role="status">
                                                <span className="sr-only">Loading...</span>
                                            </div>}
                                        </div>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <BarChart width={400} height={75}
                                              data={this.state.avgBlockTimeChart}
                                              margin={{top: 0, right: 0, left: 0, bottom: 0}}
                                              className="pointer">
                                        <Bar dataKey="blocktime" minPointSize={3}
                                             isAnimationActive={true}
                                             fill={'#34958e'} shape={<RoundedBar/>}/>}
                                    </BarChart>
                                </div>
                            </div>
                        </Col>
                        <Col md={3}>
                            <div className="card">
                                <div className="card-header">
                                    <div className="row align-items-center">
                                        <div className="col">
                                            <h4 className="card-header-title">
                                                Difficulty
                                            </h4>
                                        </div>
                                        <div className="col-auto">
                                            {this.state.difficulty || <Spinner/>}
                                        </div>
                                    </div>
                                </div>
                                <div className="card-body">
                                </div>
                            </div>
                        </Col>
                    </Row>
                    <Col className={'table-responsive'} md={12}>
                        <Table className={'table table-sm table-nowrap card-table'} borderless variant="">
                            <thead className={'text-center text-muted'}>
                            <tr>
                                <th>Pin</th>
                                <th data-toggle="tooltip" data-placement="top" title=""
                                    data-original-title="Tooltip on top">Active
                                </th>
                                <th>ID</th>
                                <th>Height</th>
                                <th>Block Time</th>
                                <th>Tickets</th>
                                <th>Mining</th>
                                <th>Syncing</th>
                                <th>Peers</th>
                                <th>Propagation</th>
                                <th>Uptime</th>
                                <th>Latency</th>
                            </tr>
                            </thead>
                            <tbody className={'text-center'}>
                            {
                                this.state.nodeIdentifiers.map(((key, index) =>
                                    <tr className='animated fadeIn'>
                                            <td><a onClick={function(){setPinnedNode(this.state.nodesList[index].id)}.bind(this)} className="btn btn-sm btn-rounded-circle btn-white">
                                                +
                                            </a></td>
                                            <td>{this.state.nodesList[index].active ?
                                                <span className="text-success">●</span> :
                                                <span className="text-danger">●</span>}</td>
                                            <td>{this.state.nodesList[index].id}</td>
                                            <td>{this.state.nodesList[index].height ||
                                            <Spinner/>} {this.state.nodesList[index].hash}</td>
                                            <td>{this.state.nodesList[index].blockLastUpdated ?
                                                <TimeAgo date={this.state.nodesList[index].blockLastUpdated}/> :
                                                <Spinner/>}</td>
                                            <td>{this.state.nodesList[index].myTicketNumber}</td>
                                            <td>{this.state.nodesList[index].mining ?
                                                <span className="text-success">●</span> :
                                                <span className="text-danger">●</span>}</td>
                                            <td>{this.state.nodesList[index].syncing ?
                                                <span className="text-success">●</span> :
                                                <span className="text-danger">●</span>}</td>
                                            <td>{this.state.nodesList[index].peers}</td>
                                            <td className={'recharts-wrapper'}>
                                                {!this.state.nodesList[index].propagationChart ? <Spinner/> :
                                                    <BarChart width={200} height={15}
                                                              data={this.state.nodesList[index].propagationChart}
                                                              margin={{top: 0, right: 0, left: 0, bottom: 0}}
                                                              className="pointer">
                                                        <Bar dataKey="id" minPointSize={3}
                                                             isAnimationActive={true}
                                                             fill={'#34958e'} shape={<RoundedBar/>}/>}
                                                    </BarChart>
                                                }
                                            </td>
                                            <td><ProgressBar now={this.state.nodesList[index].uptime} label={`${this.state.nodesList[index].uptime}%`} /></td>
                                            <td className={latencyClass(this.state.nodesList[index].latency)}>{this.state.nodesList[index].latency}
                                                <small>ms</small>
                                            </td>
                                        </tr>
                                ))
                            }
                            </tbody>
                        </Table>
                    </Col>
                </Container>
            </SkeletonTheme>
        </div>
        </body>;
    }
}

export default Main;
