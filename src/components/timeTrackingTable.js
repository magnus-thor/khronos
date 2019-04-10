import React, { Component } from "react";
import { Table, Input, Dropdown, Button } from "semantic-ui-react";
import { saveData } from "../modules/kimaiSaveTimeData";
import { getData } from "../modules/kimaiGetCustomerData";
import { getProjectData } from "../modules/kimaiGetProjectData";
import { getProjectActivities } from "../modules/kimaiGetProjectActivities";
import { getTimeData } from "../modules/kimaiGetTimeData";
import moment from "moment-timezone";

export class TimeTrackingTable extends Component {
	constructor(props) {
		super(props);
		this.state = {
			begin: "",
			end: "",
			customer: "",
			project: "",
			activity: "",
			description: "",
			fixedRate: "",
			hourlyRate: "",
			entrySaved: false,
			fetchedCustomers: [],
			timeData: [],
			fetchedCustomerProjects: [],
			fetchedAllProjects: [],
			fetchedActivities: [],
			fetchedAllActivities: []
		};
	}

	async componentDidMount() {
		await this.getCustomerData();
		await this.getAllProjects();
		await this.getAllActivities();
		await getTimeData().then(
			response => {
				this.setState({
					timeData: response
				});
			},
			reason => {
				console.log("something went wrong");
			}
		);
		this.updateTimeData();
	}

	updateTimeData() {
		let timeData = this.state.timeData;
		let projects = this.state.fetchedAllProjects;
		let customers = this.state.fetchedCustomers;
		let activities = this.state.fetchedAllActivities;
		let newTimeData = timeData.filter(timeSheet => {
			let pId = timeSheet.project;
			let pIndex = projects.findIndex(project => project.id == pId);
			timeSheet.project = projects[pIndex].name;
			let cId = projects[pIndex].customer;
			let cIndex = customers.findIndex(customer => customer.id == cId);
			timeSheet.customer = customers[cIndex].name;
			let aId = timeSheet.activity;
			let aIndex = activities.findIndex(activity => activity.id == cId);
			timeSheet.activity = activities[aIndex].name;
			return timeSheet;
		});
		this.setState({
			timeData: newTimeData
		});
	}

	entryHandler(e) {
		this.setState({ entrySaved: true });
	}

	handleCustomerChange(value) {
		this.setState({ customer: value });
		this.getCustomerProjects(value);
	}

	handleProjectChange(value) {
		this.setState({ project: value });
		this.getActivities(value);
	}

	handleActivityChange(value) {
		this.setState({ activity: value });
	}

	componentDidUpdate(oldProps) {
		if (
			oldProps.begin !== this.props.begin &&
			oldProps.end !== this.props.end
		) {
			this.setState({ begin: this.props.begin, end: this.props.end });
		}
	}

	renderTimeSheet() {
		const timeData = this.state.timeData;
		return timeData.map(entry => {
			return (
				<Table.Row>
					<Table.Cell id="beginSave">
						{moment(entry.begin)
							.tz("Europe/Stockholm")
							.format("YYYY-MM-DD HH:mm")}
					</Table.Cell>
					<Table.Cell id="endSave">
						{moment(entry.end)
							.tz("Europe/Stockholm")
							.format("YYYY-MM-DD HH:mm")}
					</Table.Cell>
					<Table.Cell>{entry.rate}</Table.Cell>
					<Table.Cell>{entry.customer}</Table.Cell>
					<Table.Cell>{entry.project}</Table.Cell>
					<Table.Cell>{entry.activity}</Table.Cell>
				</Table.Row>
			);
		});
	}

	async getAllActivities() {
		try {
			await getProjectActivities("all").then(response => {
				if (
					response.message === "Could not fetch activity data at this time."
				) {
					alert(response.message);
				} else {
					{
						let responseArray = response.data;
						let activitiesArray = responseArray.map(activity => {
							let rActivity = {};
							rActivity["name"] = activity.name;
							rActivity["id"] = activity.id;
							return rActivity;
						});
						this.setState({ fetchedAllActivities: activitiesArray });
					}
				}
			});
		} catch (error) {
			console.log(error);
		}
	}

	async getAllProjects() {
		try {
			await getProjectData("all").then(response => {
				if (response.message === "Could not fetch project data at this time.") {
					alert(response.message);
				} else {
					{
						let responseArray = response.data;
						let projectsArray = responseArray.map(project => {
							let rProject = {};
							rProject["name"] = project.name;
							rProject["id"] = project.id;
							rProject["customer"] = project.customer;
							return rProject;
						});
						this.setState({ fetchedAllProjects: projectsArray });
					}
				}
			});
		} catch (error) {
			console.log(error);
		}
	}

	async getCustomerData() {
		try {
			await getData().then(response => {
				if (
					response.message === "Could not fetch customer data at this time."
				) {
					alert(response.message);
				} else {
					{
						let responseArray = response.data;
						let companyArray = responseArray.map(company => {
							let rCompany = {};
							rCompany["name"] = company.name;
							rCompany["id"] = company.id;
							return rCompany;
						});
						this.setState({ fetchedCustomers: companyArray });
					}
				}
			});
		} catch (error) {
			console.log(error);
		}
	}

	async getCustomerProjects(value) {
		const customerId = value;
		try {
			await getProjectData(customerId).then(response => {
				if (response.message === "Could not fetch project data at this time.") {
					alert(response.message);
				} else {
					{
						let responseArray = response.data;
						let projectsArray = responseArray.map(project => {
							let rProject = {};
							rProject["name"] = project.name;
							rProject["id"] = project.id;
							return rProject;
						});
						this.setState({ fetchedCustomerProjects: projectsArray });
					}
				}
			});
		} catch (error) {
			console.log(error);
		}
	}

	async getActivities(value) {
		const projectId = value;
		try {
			await getProjectActivities(projectId).then(response => {
				if (
					response.message === "Could not fetch activity data at this time."
				) {
					alert(response.message);
				} else {
					{
						let responseArray = response.data;
						let activitiesArray = responseArray.map(activity => {
							let rActivity = {};
							rActivity["name"] = activity.name;
							rActivity["id"] = activity.id;
							return rActivity;
						});
						this.setState({ fetchedActivities: activitiesArray });
					}
				}
			});
		} catch (error) {
			console.log(error);
		}
	}

	updateTimeDataHandler(data) {
		let timeData = this.state.timeData;
		timeData.push(data);
		const newTimeData = [data, ...timeData];
		this.setState({
			timeData: newTimeData
		});
	}

	async saveTimeData() {
		const values = {
			begin: this.state.begin,
			end: this.state.end,
			customer: this.state.customer,
			project: this.state.project,
			activity: this.state.activity,
			description: "description",
			fixedRate: "",
			hourlyRate: this.state.hourlyRate
		};
		try {
			await saveData(values).then(response => {
				if (response.message === "Entry saved") {
					this.entryHandler();
					setTimeout(
						function() {
							getTimeData().then(response => {
								this.setState({
									timeData: response
								});
							});
						}.bind(this),
						1000
					);
				} else {
					alert(response.message);
				}
			});
		} catch (error) {
			console.log(error);
		}
	}

	render() {
		let saveButton;

		const customerOptions = this.state.fetchedCustomers;
		const projectOptions = this.state.fetchedCustomerProjects;
		const taskOptions = this.state.fetchedActivities;

		if (this.state.entrySaved === false) {
			saveButton = (
				<>
					<Button onClick={this.saveTimeData.bind(this)}>Save</Button>
				</>
			);
		} else if (this.state.entrySaved === true) {
			saveButton = (
				<>
					<p>Your time was saved</p>
				</>
			);
		}

		let listEntries = this.renderTimeSheet();

		return (
			<>
				<Table celled>
					<Table.Header name="tableHeader">
						<Table.Row name="tableRow">
							<Table.HeaderCell>Start Time</Table.HeaderCell>
							<Table.HeaderCell>End Time</Table.HeaderCell>
							<Table.HeaderCell>Rate</Table.HeaderCell>
							<Table.HeaderCell>Customer</Table.HeaderCell>
							<Table.HeaderCell>Project</Table.HeaderCell>
							<Table.HeaderCell>Task</Table.HeaderCell>
							<Table.HeaderCell> </Table.HeaderCell>
						</Table.Row>
					</Table.Header>

					<Table.Body>
						<Table.Row>
							<Table.Cell>
								<Input
									id="begin"
									placeholder="YYYY-MM-DD HH:MM"
									onChange={e =>
										this.setState({ begin: e.target.value, entrySaved: false })
									}
									value={this.state.begin}
								/>
							</Table.Cell>
							<Table.Cell>
								<Input
									id="end"
									placeholder="YYYY-MM-DD HH:MM"
									onChange={e =>
										this.setState({ end: e.target.value, entrySaved: false })
									}
									value={this.state.end}
								/>
							</Table.Cell>
							<Table.Cell>
								<Input
									id="hourlyRate"
									placeholder="$"
									onChange={e =>
										this.setState({
											hourlyRate: e.target.value,
											entrySaved: false
										})
									}
								/>
							</Table.Cell>
							<Table.Cell>
								<Dropdown
									id="customer"
									className="customer"
									selection
									defaultValue=""
									options={customerOptions}
									onChange={(e, { value }) => this.handleCustomerChange(value)}
								/>
							</Table.Cell>
							<Table.Cell>
								<Dropdown
									id="project"
									className="project"
									selection
									defaultValue=""
									options={projectOptions}
									onChange={(e, { value }) => this.handleProjectChange(value)}
								/>
							</Table.Cell>
							<Table.Cell>
								<Dropdown
									id="activity"
									className="activity"
									selection
									defaultValue=""
									options={taskOptions}
									onChange={(e, { value }) => this.handleActivityChange(value)}
								/>
							</Table.Cell>
							<Table.Cell>{saveButton}</Table.Cell>
						</Table.Row>
						{listEntries}
					</Table.Body>

					<Table.Footer>
						<Table.Row>
							<Table.HeaderCell textAlign="center" colSpan="7" />
						</Table.Row>
					</Table.Footer>
				</Table>
			</>
		);
	}
}
