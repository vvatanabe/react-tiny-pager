import * as React from 'react';

namespace ClassName {
	export const PANEL =         'react-tiny-pager-panel'
	export const PAGE =          'react-tiny-pager-panel__page'
	export const PAGE_PREV =     'react-tiny-pager-panel__page-prev'
	export const PAGE_NEXT =     'react-tiny-pager-panel__page-next'
	export const PAGE_ELLIPSIS = 'react-tiny-pager-panel__page-ellipsis'
	export const PAGE_SELECTED = 'react-tiny-pager-panel__page-selected'
	export const PAGE_DISABLED = 'react-tiny-pager-panel__page-disabled'
}

namespace PageKey {
	export const PREV = 'prev';
	export const NEXT = 'next';
	export const ELLIPSIS = 'ellipsis';
}

export interface TinyPagerStateProps extends React.Props<{}> {
	current?: number;
}

export interface TinyPagerDispatchProps extends React.Props<{}> {
	onChangeTo?(page: number);
	onMouseOverTo?(page: string);
	onMouseOutTo?(page: string);
}

export type TinyPagerProps = {
	total?: number;
	visiblePages?: number;
	fixePages?: number;
	titles?: {
		prev: string;
		next: string;
		ellipsis: string;
	}
} & TinyPagerStateProps & TinyPagerDispatchProps;

const TinyPager: React.StatelessComponent<TinyPagerProps> = props => {

	const {
		current,
		total,
		visiblePages,
		fixePages,
		titles,
		onChangeTo,
		onMouseOverTo,
		onMouseOutTo
	} = props;

	function handlePrevPage() {
		handleChangePage(current - 1);
	}

	function handleNextPage() {
		handleChangePage(current + 1);
	}

	function handleChangePage(newPage: number) {
		onChangeTo(newPage);
	}

	function handleMouseOver(page: string) {
		onMouseOverTo(page);
	}

	function handleMouseOut(page: string) {
		onMouseOutTo(page);
	}

	function isDisabled(): boolean {
		return current === 1 || current === props.total;
	}

	function isSelected(page): boolean {
		return current === page;
	}

	function isEven(num: number): boolean {
			return num % 2 === 0;
	}

	function calcVisibleRange(): { from: number, to: number } {
		const ellipsis = {
			head: fixePages + 2,
			tail: total - fixePages + 2
		}
		const visible = {
			head: current - (isEven(visiblePages) ? visiblePages / 2 : Math.floor(visiblePages / 2)),
			tail: current + (isEven(visiblePages) ? visiblePages / 2 - 1 : Math.floor(visiblePages / 2))
		}
		if (visible.head <= ellipsis.head && ellipsis.tail < visible.tail) {
				return {
					from: 1,
					to: total
				}
		}
		if (visible.head < 1 && visible.tail < ellipsis.tail) {
			return {
				from: 1,
				to: visiblePages
			}
		}
		if (visible.head <= ellipsis.head && visible.tail <= ellipsis.tail) {
			return {
				from: 1,
				to: visible.tail
			}
		}
		if (ellipsis.head < visible.head && props.total <= visible.tail) {
			return {
				from: total - props.visiblePages + 1,
				to: total
			}
		}
		if (ellipsis.head < visible.head && ellipsis.tail < visible.tail) {
			return {
				from: visible.head,
				to: total
			}
		}
		return {
			from: visible.head,
			to: visible.tail
		}
	}

	function createPagePropsCollection(): PageProps[] {
		const visibleRange = calcVisibleRange();
		const pages: PageProps[] = [];
		if (visibleRange.from !== 1) {
			range(1, fixePages).forEach(index => {
				pages.push({
					title: `${index}`,
					className: ClassName.PAGE,
					key:  `${index}`,
					selected: isSelected(index)
				});
			});
			pages.push({
				title: titles.ellipsis,
				className: ClassName.PAGE_ELLIPSIS
			});
		}
		range(visibleRange.from, visibleRange.to).forEach(index => {
			pages.push({
				title: `${index}`,
				className: ClassName.PAGE,
				selected: isSelected(index)
			});
		});
		if (visibleRange.to !== total) {
			pages.push({
				title: titles.ellipsis,
				className: ClassName.PAGE_ELLIPSIS
			});
			range(total - fixePages - 1, total).forEach(index => {
				pages.push({
					title: `${index}`,
					className: ClassName.PAGE,
					selected: isSelected(index)
				});
			});
		}
		return pages;
	}

	return (
		<ul className={ClassName.PANEL}>
			<Page
				key={PageKey.PREV}
				title={titles.prev}
				className={ClassName.PAGE_PREV}
				disabled={isDisabled()}
				onClick={handlePrevPage}
				onMouseOver={handleMouseOver}
				onMouseOut={handleMouseOut}
				/>
			{
				createPagePropsCollection().map(props => (
					<Page
						key={props.key}
						title={props.title}
						className={props.className}
						onClick={handlePrevPage}
						onMouseOver={handleMouseOver}
						onMouseOut={handleMouseOut}
					/>
				))
			}
			<Page
				key={PageKey.NEXT}
				title={titles.next}
				className={ClassName.PAGE_NEXT}
				disabled={isDisabled()}
				onClick={handlePrevPage}
				onMouseOver={handleMouseOver}
				onMouseOut={handleMouseOut}
				/>
	</ul>
	)
}

TinyPager.defaultProps.current = 1;
TinyPager.defaultProps.total = 20;
TinyPager.defaultProps.visiblePages = 5;
TinyPager.defaultProps.fixePages = 1;
TinyPager.defaultProps.titles = {
	prev: 'prev',
	next: 'next',
	ellipsis: '...'
};

// function* range(begin, end, interval = 1): Iterable<number> {
//   for (let i = begin; i <= end; i += interval) {
//     yield i;
//   }
// }

function range(begin: number, end: number, interval = 1): number[] {
	const r: number[] = [];
  for (let i = begin; i <= end; i += interval) {
    r.push(i);
  }
	return r;
}

interface PageProps extends React.Props<{}> {
		title: string;
		className: string;
		key?: string;
		disabled?: boolean;
		selected?: boolean;
		onClick?(page: number);
		onMouseOver?(page: string);
		onMouseOut?(page: string);
}

const Page: React.StatelessComponent<PageProps> = props => {

	function getClassNames() {
		const classNames = [ props.className ];
		if (props.disabled) {
			classNames.push(ClassName.PAGE_DISABLED);
		}
		if (props.selected) {
			classNames.push(ClassName.PAGE_SELECTED);
		}
		return classNames.join(' ');
	}

	function handleClick(e) {
		if (!props.disabled && !props.selected) {
			props.onClick(Number(props.key));
		}
	}

	function handleMouseOver(e) {
		if (!props.disabled) {
			props.onMouseOver(props.key);
		}
	}

	function handleMouseOut(e) {
		if (!props.disabled) {
			props.onMouseOut(props.key);
		}
	}

	return (
		<li
			className={getClassNames()}
			onClick={handleClick}
			onMouseOver={handleMouseOver}
			onMouseOut={handleMouseOut}
		>
			<span>{props.title}</span>
		</li>
	)
}

Page.defaultProps.key = undefined;
Page.defaultProps.disabled = false;
Page.defaultProps.selected = false;
Page.defaultProps.onClick = page => {};
Page.defaultProps.onMouseOver = page => {};
Page.defaultProps.onMouseOut = page => {};

export default TinyPager;