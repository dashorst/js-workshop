package nl.topicus.data;

import java.util.List;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement(name = "customers")
@XmlAccessorType(XmlAccessType.FIELD)
public class Customers
{
	@XmlElement(name = "customer")
	private List<Customer> customers;

	public Customers()
	{
	}

	public Customers(List<Customer> customers)
	{
		this.customers = customers;
	}

	public List<Customer> getCustomers()
	{
		return customers;
	}
}
