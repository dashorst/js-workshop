package nl.topicus;

import java.util.Arrays;
import java.util.List;

import org.apache.wicket.Component;
import org.apache.wicket.ajax.AjaxRequestTarget;
import org.apache.wicket.ajax.attributes.AjaxRequestAttributes;
import org.apache.wicket.markup.html.WebMarkupContainer;
import org.apache.wicket.markup.html.WebPage;
import org.apache.wicket.markup.html.basic.Label;
import org.apache.wicket.markup.html.list.ListItem;
import org.apache.wicket.markup.html.list.ListView;
import org.apache.wicket.request.mapper.parameter.PageParameters;
import org.odlabs.wiquery.ui.selectable.SelectableBehavior;
import org.odlabs.wiquery.ui.selectable.SelectableBehavior.AjaxSelectionCallback;

public class HomePage extends WebPage {
	private static final long serialVersionUID = 1L;

	public HomePage(final PageParameters parameters) {
		super(parameters);

		List<String> values = Arrays.asList("Value 1", "Value 2", "Value 3",
				"Value 4", "Value 5");
		ListView<String> listView = new ListView<String>("listView", values) {
			private static final long serialVersionUID = 1L;

			@Override
			protected void populateItem(ListItem<String> item) {
				item.add(new Label("item", item.getModel()));
				item.setOutputMarkupId(true);
			}
		};

		SelectableBehavior selectable = new SelectableBehavior() {
			@Override
			protected void updateAjaxAttributes(AjaxRequestAttributes attributes) {
				super.updateAjaxAttributes(attributes);
				attributes.getExtraParameters().put("test", "test");
			}
		};
		selectable.setStopEvent(new AjaxSelectionCallback() {
			private static final long serialVersionUID = 1L;

			@Override
			protected void selection(AjaxRequestTarget target,
					Component source, List<Component> selectedComponents) {
				System.out.println(selectedComponents);
			}
		});
		WebMarkupContainer selectableWicket = new WebMarkupContainer(
				"selectableWicket");
		selectableWicket.add(selectable);
		selectableWicket.add(listView);
		add(selectableWicket);

	}
}
