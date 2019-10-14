import React from 'react';
import {
    Card,
    Row,
    Col,
    Container,
    Spinner,
    Button,
    Nav,
    Navbar,
    NavbarBrand,
    NavDropdown,
    Table,
    Form,
    FormControl
} from 'react-bootstrap'
import Skeleton, {SkeletonTheme} from 'react-loading-skeleton';
import FontAwesome from 'react-loading-skeleton';
import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

let W3CWebSocket = require('websocket').w3cwebsocket;

class Main extends React.Component {
    constructor(props) {
        super(props);
        let client = new W3CWebSocket('wss://node.fusionnetwork.io/primus');

        let allNodes = [];
        let identifiers = [];
        client.onmessage = (data) => {
            let action = JSON.parse(data.data).action;
            if (action === 'charts') {
                let chartData = JSON.parse(data.data).data;
                let highestBlock = Math.max(...chartData.height);
                let heightChart = chartData.height;
                let avgBlockTime = chartData.avgBlocktime.toString().substr(0, 5);
                let difficulty = Math.max(...chartData.difficulty);

                this.setState({
                    highestBlock: highestBlock,
                    chartData: heightChart,
                    avgBlockTime: avgBlockTime,
                    difficulty: difficulty
                });
            }

            if (action === 'stats') {
                let id = JSON.parse(data.data).data.id;
                let stats = JSON.parse(data.data).data.stats;
                stats.id = id;

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
                if(objIndex === -1){

                } else {
                    console.log(objIndex);
                    allNodes[objIndex].height = blockData.block.number;
                    this.setState({
                        nodesList: allNodes
                    })
                    this.forceUpdate()
                }
            }
        }
    }

    state = {
        highestBlock: undefined,
        chartData: {},
        avgBlockTime: 0,
        difficulty: 0,
        nodesList: [],
        nodeIdentifiers: [],
        totalNodes: undefined,
    }

    render() {
        return <div>
            <SkeletonTheme color="#202020" highlightColor="#444">
                <Navbar bg="primary" expand="lg">
                    <Container>
                        <Navbar.Brand href="#home">FUSION Network Monitor</Navbar.Brand>
                        <div>
                            <span>{this.state.totalNodes || <Skeleton width={20}/>}</span>
                        </div>
                    </Container>
                </Navbar>
                <Container>
                    <Row>
                        <Col md={3}>
                            <Card>
                                <Card.Body>
                                    <Card.Title>Highest Block</Card.Title>
                                    <Card.Text>
                                        {this.state.highestBlock || <Skeleton/>}
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card>
                                <Card.Body>
                                    <Card.Title>Average Block Time</Card.Title>
                                    <Card.Text>
                                        {this.state.avgBlockTime || <Skeleton/>}
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card>
                                <Card.Body>
                                    <Card.Title>Difficulty</Card.Title>
                                    <Card.Text>
                                        {this.state.difficulty || <Skeleton/>}
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card>
                                <Card.Body>
                                    <Card.Title>Average Block Time</Card.Title>
                                    <Card.Text>
                                        {this.state.avgBlockTime || <Skeleton/>}
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    <Col className={'table-width'} md={12}>
                        <Table className={'table-width'} borderless variant="">
                            <thead>
                            <tr>
                                <th>Active</th>
                                <th>ID</th>
                                <th>Height</th>
                                <th>Tickets</th>
                                <th>Syncing</th>
                                <th>Peers</th>
                                <th>Uptime</th>
                            </tr>
                            </thead>
                            <tbody>
                            {
                                this.state.nodeIdentifiers.map(((key, index) =>
                                        <tr>
                                            <td>{this.state.nodesList[index].active ? 'true' : 'false'}</td>
                                            <td>{this.state.nodesList[index].id}</td>
                                            <td># {this.state.nodesList[index].height || 'loading'}</td>
                                            <td>{this.state.nodesList[index].myTicketNumber}</td>
                                            <td>{this.state.nodesList[index].syncing ? 'true' :
                                                'false'}</td>
                                            <td>{this.state.nodesList[index].peers}</td>
                                            <td>{this.state.nodesList[index].uptime}</td>
                                        </tr>
                                    // <div>{JSON.stringify(this.state.nodesList[this.state.nodeIdentifiers[key]])}</div>
                                ))
                            }
                            </tbody>
                        </Table>
                    </Col>
                </Container>
            </SkeletonTheme>
        </div>;
    }
}

export default Main;
